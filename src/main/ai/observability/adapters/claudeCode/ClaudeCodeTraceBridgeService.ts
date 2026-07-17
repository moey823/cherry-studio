import { BaseService, Injectable, Phase, ServicePhase } from '@main/core/lifecycle'

export interface ClaudeCodeTraceContext {
  topicId: string
  traceId: string
  modelName?: string
  sessionId: string
  turnId: string
  rootSpanId: string
}

/** Privacy build: never ask Claude Code to emit prompts, tool data, or API bodies as telemetry. */
@Injectable('ClaudeCodeTraceBridgeService')
@ServicePhase(Phase.WhenReady)
export class ClaudeCodeTraceBridgeService extends BaseService {
  isTraceModeEnabled(): boolean {
    return false
  }

  prepareTrace(_context: ClaudeCodeTraceContext): Promise<Record<string, string> | undefined> {
    void _context
    return Promise.resolve(undefined)
  }
}
