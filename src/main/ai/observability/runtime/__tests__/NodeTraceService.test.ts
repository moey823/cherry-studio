import { describe, expect, it, vi } from 'vitest'

const { ipcMainHandle } = vi.hoisted(() => ({ ipcMainHandle: vi.fn() }))

vi.mock('electron', () => ({ ipcMain: { handle: ipcMainHandle } }))

import { NodeTraceService } from '../NodeTraceService'

describe('NodeTraceService privacy behavior', () => {
  it('does not patch IPC or start a telemetry collector', async () => {
    const service = new NodeTraceService()

    await service._doInit()

    expect(ipcMainHandle).not.toHaveBeenCalled()
    expect('server' in service).toBe(false)
  })
})
