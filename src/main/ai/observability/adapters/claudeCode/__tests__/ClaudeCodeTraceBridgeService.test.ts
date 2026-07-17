import { BaseService } from '@main/core/lifecycle'
import { beforeEach, describe, expect, it } from 'vitest'

import { ClaudeCodeTraceBridgeService } from '../ClaudeCodeTraceBridgeService'

const traceContext = {
  topicId: 'agent-session:session-1',
  traceId: 'a'.repeat(32),
  modelName: 'claude-sonnet',
  sessionId: 'session-1',
  turnId: 'turn-1',
  rootSpanId: '1'.repeat(16)
}

describe('ClaudeCodeTraceBridgeService privacy behavior', () => {
  beforeEach(() => {
    BaseService.resetInstances()
  })

  it('keeps trace mode disabled', () => {
    expect(new ClaudeCodeTraceBridgeService().isTraceModeEnabled()).toBe(false)
  })

  it('never returns telemetry environment variables', async () => {
    const service = new ClaudeCodeTraceBridgeService()

    await expect(service.prepareTrace(traceContext)).resolves.toBeUndefined()
    expect('server' in service).toBe(false)
  })
})
