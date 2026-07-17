import { BaseService, Injectable, Phase, ServicePhase } from '@main/core/lifecycle'

/** Privacy build: cross-process OpenTelemetry collection is disabled. */
@Injectable('NodeTraceService')
@ServicePhase(Phase.WhenReady)
export class NodeTraceService extends BaseService {}
