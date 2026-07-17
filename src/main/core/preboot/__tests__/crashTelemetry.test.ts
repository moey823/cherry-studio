import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { appOn, crashReporterStart, processOn } = vi.hoisted(() => ({
  appOn: vi.fn(),
  crashReporterStart: vi.fn(),
  processOn: vi.fn<(event: string, listener: (...args: unknown[]) => void) => NodeJS.Process>(() => process)
}))

vi.mock('electron', () => ({
  app: { on: appOn },
  crashReporter: { start: crashReporterStart }
}))

const originalProcessOn = process.on.bind(process)

beforeEach(() => {
  vi.clearAllMocks()
  ;(process as unknown as { on: typeof processOn }).on = processOn
})

afterEach(() => {
  ;(process as unknown as { on: typeof originalProcessOn }).on = originalProcessOn
})

describe('initCrashTelemetry privacy behavior', () => {
  it('keeps local error logging without starting crash collection', async () => {
    const { initCrashTelemetry } = await import('../crashTelemetry')

    initCrashTelemetry()

    expect(crashReporterStart).not.toHaveBeenCalled()
    expect(appOn).not.toHaveBeenCalled()
    expect(processOn.mock.calls.map(([event]) => event)).toEqual(['uncaughtException', 'unhandledRejection'])
  })
})
