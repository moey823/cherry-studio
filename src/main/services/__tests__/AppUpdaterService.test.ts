import { beforeEach, describe, expect, it, vi } from 'vitest'

const { autoUpdater } = vi.hoisted(() => ({
  autoUpdater: {
    logger: null as unknown,
    forceDevUpdateConfig: false,
    autoDownload: true,
    autoInstallOnAppQuit: true,
    requestHeaders: {} as Record<string, string>,
    on: vi.fn(),
    removeListener: vi.fn(),
    setFeedURL: vi.fn(),
    checkForUpdates: vi.fn(),
    downloadUpdate: vi.fn(),
    quitAndInstall: vi.fn(),
    channel: '',
    allowDowngrade: false,
    disableDifferentialDownload: false,
    currentVersion: '1.0.0'
  }
}))

vi.mock('@main/core/platform', () => ({ isWin: false }))
vi.mock('electron', () => ({
  app: { isPackaged: true, getVersion: vi.fn(() => '1.0.0') }
}))
vi.mock('electron-updater', () => ({ autoUpdater }))

import { AppUpdaterService } from '../AppUpdaterService'

describe('AppUpdaterService privacy behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.requestHeaders = {}
  })

  it('initializes without checking for updates or attaching client metadata', async () => {
    const service = new AppUpdaterService()

    await service._doInit()

    expect(autoUpdater.checkForUpdates).not.toHaveBeenCalled()
    expect(autoUpdater.autoDownload).toBe(false)
    expect(autoUpdater.autoInstallOnAppQuit).toBe(false)
    expect(autoUpdater.requestHeaders).toEqual({ 'Cache-Control': 'no-cache' })
  })
})
