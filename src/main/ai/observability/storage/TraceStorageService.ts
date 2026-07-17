import { BaseService, Injectable, Phase, ServicePhase } from '@main/core/lifecycle'
import type { SpanEntity } from '@mcp-trace/trace-core/types/config'
import type { ReadableSpan, TimedEvent } from '@opentelemetry/sdk-trace-base'
import { IpcChannel } from '@shared/IpcChannel'

/**
 * Compatibility surface for the removed developer trace store.
 *
 * Privacy builds never retain prompts, model responses, tool payloads, or OTLP
 * spans in memory or on disk. The empty IPC responses keep old trace-viewer UI
 * paths harmless instead of turning telemetry back on.
 */
@Injectable('TraceStorageService')
@ServicePhase(Phase.WhenReady)
export class TraceStorageService extends BaseService {
  protected onInit(): void {
    this.ipcHandle(IpcChannel.TRACE_GET_DATA, () => [])
    this.ipcHandle(IpcChannel.TRACE_CLEAN_LOCAL_DATA, () => undefined)
  }

  createSpan(_span: ReadableSpan): void {
    void _span
  }

  endSpan(_span: ReadableSpan): void {
    void _span
  }

  clear(): void {}

  cleanLocalData(): Promise<void> {
    return Promise.resolve()
  }

  saveSpans(_topicId: string): Promise<void> {
    void _topicId
    return Promise.resolve()
  }

  setTopicId(_traceId: string, _topicId: string): void {
    void _traceId
    void _topicId
  }

  saveEntity(_entity: SpanEntity): void {
    void _entity
  }

  addSpanEvent(_traceId: string, _spanId: string, _event: TimedEvent): void {
    void _traceId
    void _spanId
    void _event
  }

  getSpans(_topicId: string, _traceId: string): Promise<SpanEntity[]> {
    void _topicId
    void _traceId
    return Promise.resolve([])
  }
}
