import type { TelemetrySettings } from 'ai'

import type { RequestScope } from './scope'

/** Privacy build: AI SDK prompt/output telemetry is permanently disabled. */
export function buildTelemetry(_scope: RequestScope): TelemetrySettings | undefined {
  void _scope
  return undefined
}
