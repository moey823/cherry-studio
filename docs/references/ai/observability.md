# Observability in the privacy build

The privacy branch disables AI telemetry and removes every exporter and
provider-body capture path. Chat prompts, model responses, tool payloads, and
Claude Code OTLP events are not collected for tracing or written to trace
history files.

## Runtime behavior

- `buildTelemetry()` always returns `undefined`, so the AI SDK receives no
  experimental telemetry configuration or tracer.
- `ClaudeCodeTraceBridgeService` never supplies OTLP environment variables or
  starts an ingest endpoint.
- `NodeTraceService` does not register an OpenTelemetry provider, processor, or
  exporter.
- `TraceStorageService` is a compatibility no-op. Its read IPC returns an empty
  list, and it does not retain or persist spans.
- The observability sink registry has no registered sinks.
- Provider requests use their normal fetch implementation. The old developer
  wrapper that duplicated request and response bodies into trace spans has been
  removed.
- Electron crash reporting and renderer stack collection are disabled. Preboot
  keeps only local process-error logging.

## Compatibility surface

Some turn-level trace types and calls remain because the stream and agent
session APIs use trace identifiers as internal correlation values. With no
registered OpenTelemetry provider, those calls use the default no-op tracer;
there is no exporter, listener, trace file, or remote destination behind them.

The trace-viewer IPC surface remains so older renderer paths fail closed: reads
return no data and cleanup requests do nothing.

## Network boundary

This change does not disable network features the user explicitly invokes,
such as model-provider calls, web search, OAuth, marketplace search, downloads,
or a manual update check. It removes passive telemetry, background trace
collection, and automatic trace export.
