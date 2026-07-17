import process from 'node:process'

import { loggerService } from '@logger'
import { isDev } from '@main/core/platform'

const logger = loggerService.withContext('CrashTelemetry')

/**
 * Install local process-error logging. The privacy build does not start
 * Electron crash reporting, collect renderer call stacks, or upload reports.
 *
 * Runs during preboot, before `app.whenReady()`. Safe to call once.
 * Timing contract:
 *   - Must run before any code that could plausibly throw after module
 *     load (so the process-level handlers are armed early).
 *   - Has no ordering relationship with other preboot modules.
 *
 * See core/preboot/README.md for the preboot membership criteria.
 */
export function initCrashTelemetry(): void {
  installProcessErrorHandlers()
}

/**
 * In production, install last-resort handlers for `uncaughtException` and
 * `unhandledRejection`. In dev, leave both unset so errors propagate to the
 * terminal with their full, unswallowed stack traces.
 */
function installProcessErrorHandlers(): void {
  if (isDev) return

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error)
  })

  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`)
  })
}
