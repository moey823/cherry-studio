import { application } from '@application'
import { loggerService } from '@logger'
import { BaseService, DependsOn, Injectable, Phase, ServicePhase } from '@main/core/lifecycle'
import { isWin } from '@main/core/platform'
import { WindowType } from '@main/core/window/types'
import { UpgradeChannel } from '@shared/data/preference/preferenceTypes'
import type { ProgressInfo, UpdateInfo } from 'builder-util-runtime'
import { CancellationToken } from 'builder-util-runtime'
import { app } from 'electron'
import type { Logger, NsisUpdater, UpdateCheckResult } from 'electron-updater'
import { autoUpdater } from 'electron-updater'

const logger = loggerService.withContext('AppUpdaterService')

export enum FeedUrl {
  GITHUB_LATEST = 'https://github.com/CherryHQ/cherry-studio/releases/latest/download'
}

// Language markers constants for multi-language release notes
const LANG_MARKERS = {
  EN_START: '<!--LANG:en-->',
  ZH_CN_START: '<!--LANG:zh-CN-->',
  END: '<!--LANG:END-->'
}

@Injectable('AppUpdaterService')
@ServicePhase(Phase.WhenReady)
@DependsOn(['WindowManager'])
export class AppUpdaterService extends BaseService {
  private cancellationToken: CancellationToken = new CancellationToken()
  private updateCheckResult: UpdateCheckResult | null = null

  protected async onInit(): Promise<void> {
    autoUpdater.logger = logger as Logger
    autoUpdater.forceDevUpdateConfig = !app.isPackaged
    // Privacy build: updates are checked and downloaded only after the user
    // presses the explicit "Check for updates" button.
    autoUpdater.autoDownload = false
    // Never auto-install on quit - user must explicitly click "Install Now"
    // Auto-install on quit can cause issues: unexpected updates on restart,
    // corruption if system shuts down during install, or app uninstall on force shutdown
    autoUpdater.autoInstallOnAppQuit = false
    autoUpdater.requestHeaders = { 'Cache-Control': 'no-cache' }

    this.registerAutoUpdaterListeners()

    if (isWin) {
      ;(autoUpdater as NsisUpdater).installDirectory = application.getPath('app.install')
    }
  }

  protected async onAllReady(): Promise<void> {
    application.get('PowerService').registerShutdownHandler(() => {
      autoUpdater.autoDownload = false
    })
  }

  private registerAutoUpdaterListeners(): void {
    const onError = (error: Error) => {
      logger.error('update error', error)
      application.get('IpcApiService').broadcastToType(WindowType.Main, 'app.updater.error', error)
    }
    autoUpdater.on('error', onError)
    this.registerDisposable(() => autoUpdater.removeListener('error', onError))

    const onUpdateAvailable = (releaseInfo: UpdateInfo) => {
      logger.info('update available', releaseInfo)
      const processedReleaseInfo = this.processReleaseInfo(releaseInfo)
      application.get('IpcApiService').broadcastToType(WindowType.Main, 'app.updater.available', processedReleaseInfo)
    }
    autoUpdater.on('update-available', onUpdateAvailable)
    this.registerDisposable(() => autoUpdater.removeListener('update-available', onUpdateAvailable))

    const onUpdateNotAvailable = () => {
      application.get('IpcApiService').broadcastToType(WindowType.Main, 'app.updater.not_available', undefined)
    }
    autoUpdater.on('update-not-available', onUpdateNotAvailable)
    this.registerDisposable(() => autoUpdater.removeListener('update-not-available', onUpdateNotAvailable))

    const onDownloadProgress = (progress: ProgressInfo) => {
      application.get('IpcApiService').broadcastToType(WindowType.Main, 'app.updater.download_progress', progress)
    }
    autoUpdater.on('download-progress', onDownloadProgress)
    this.registerDisposable(() => autoUpdater.removeListener('download-progress', onDownloadProgress))

    const onUpdateDownloaded = (releaseInfo: UpdateInfo) => {
      const processedReleaseInfo = this.processReleaseInfo(releaseInfo)
      application.get('IpcApiService').broadcastToType(WindowType.Main, 'app.updater.downloaded', processedReleaseInfo)
      logger.info('update downloaded', processedReleaseInfo)
    }
    autoUpdater.on('update-downloaded', onUpdateDownloaded)
    this.registerDisposable(() => autoUpdater.removeListener('update-downloaded', onUpdateDownloaded))
  }

  private setManualUpdateFeed() {
    autoUpdater.channel = UpgradeChannel.LATEST
    autoUpdater.setFeedURL(FeedUrl.GITHUB_LATEST)

    // disable downgrade after change the channel
    autoUpdater.allowDowngrade = false
    // GitHub releases do not support differential range downloads reliably.
    autoUpdater.disableDifferentialDownload = true
  }

  public cancelDownload() {
    this.cancellationToken.cancel()
    this.cancellationToken = new CancellationToken()
    if (autoUpdater.autoDownload) {
      this.updateCheckResult?.cancellationToken?.cancel()
    }
  }

  private isPortable(): boolean {
    return isWin && 'PORTABLE_EXECUTABLE_DIR' in process.env
  }

  private async _runUpdateCheck() {
    if (this.isPortable()) {
      return {
        currentVersion: app.getVersion(),
        updateInfo: null
      }
    }

    this.setManualUpdateFeed()

    this.updateCheckResult = await autoUpdater.checkForUpdates()
    logger.info(
      `update check result: ${this.updateCheckResult?.isUpdateAvailable}, channel: ${autoUpdater.channel}, currentVersion: ${autoUpdater.currentVersion}`
    )

    if (this.updateCheckResult?.isUpdateAvailable && !autoUpdater.autoDownload) {
      // 如果 autoDownload 为 false，则需要再调用下面的函数触发下
      // do not use await, because it will block the return of this function
      logger.info('downloadUpdate manual by check for updates', this.cancellationToken)
      void autoUpdater.downloadUpdate(this.cancellationToken)
    }

    return {
      currentVersion: autoUpdater.currentVersion,
      updateInfo: this.updateCheckResult?.isUpdateAvailable ? this.updateCheckResult?.updateInfo : null
    }
  }

  public async checkForUpdates() {
    try {
      return await this._runUpdateCheck()
    } catch (error) {
      logger.error('Failed to check for update:', error as Error)
      return {
        currentVersion: app.getVersion(),
        updateInfo: null
      }
    }
  }

  public quitAndInstall() {
    application.markQuitting()
    setImmediate(() => autoUpdater.quitAndInstall(true, true))
  }

  /**
   * Check if release notes contain multi-language markers
   */
  private hasMultiLanguageMarkers(releaseNotes: string): boolean {
    return releaseNotes.includes(LANG_MARKERS.EN_START)
  }

  /**
   * Parse multi-language release notes and return the appropriate language version
   * @param releaseNotes - Release notes string with language markers
   * @returns Parsed release notes for the user's language
   *
   * Expected format:
   * <!--LANG:en-->English content<!--LANG:zh-CN-->Chinese content<!--LANG:END-->
   */
  private parseMultiLangReleaseNotes(releaseNotes: string): string {
    try {
      const language = application.get('PreferenceService').get('app.language')
      const isChineseUser = language === 'zh-CN' || language === 'zh-TW'

      // Create regex patterns using constants
      const enPattern = new RegExp(
        `${LANG_MARKERS.EN_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)${LANG_MARKERS.ZH_CN_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
      )
      const zhPattern = new RegExp(
        `${LANG_MARKERS.ZH_CN_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)${LANG_MARKERS.END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
      )

      // Extract language sections
      const enMatch = releaseNotes.match(enPattern)
      const zhMatch = releaseNotes.match(zhPattern)

      // Return appropriate language version with proper fallback
      if (isChineseUser && zhMatch) {
        return zhMatch[1].trim()
      } else if (enMatch) {
        return enMatch[1].trim()
      } else {
        // Clean fallback: remove all language markers
        logger.warn('Failed to extract language-specific release notes, using cleaned fallback')
        return releaseNotes
          .replace(new RegExp(`${LANG_MARKERS.EN_START}|${LANG_MARKERS.ZH_CN_START}|${LANG_MARKERS.END}`, 'g'), '')
          .trim()
      }
    } catch (error) {
      logger.error('Failed to parse multi-language release notes', error as Error)
      // Return original notes as safe fallback
      return releaseNotes
    }
  }

  /**
   * Process release info to handle multi-language release notes
   * @param releaseInfo - Original release info from updater
   * @returns Processed release info with localized release notes
   */
  private processReleaseInfo(releaseInfo: UpdateInfo): UpdateInfo {
    const processedInfo = { ...releaseInfo }

    // Handle multi-language release notes in string format
    if (releaseInfo.releaseNotes && typeof releaseInfo.releaseNotes === 'string') {
      // Check if it contains multi-language markers
      if (this.hasMultiLanguageMarkers(releaseInfo.releaseNotes)) {
        processedInfo.releaseNotes = this.parseMultiLangReleaseNotes(releaseInfo.releaseNotes)
      }
    }

    return processedInfo
  }
}
