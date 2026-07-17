import { BaseService } from '@main/core/lifecycle'
import { beforeEach, describe, expect, it } from 'vitest'

import { TraceStorageService } from '../TraceStorageService'

describe('TraceStorageService privacy behavior', () => {
  beforeEach(() => BaseService.resetInstances())

  it('does not activate or retain trace data', async () => {
    const service = new TraceStorageService()

    await service._doInit()
    service.setTopicId('trace', 'topic')
    service.saveEntity({ id: 'span' } as never)

    expect(service.isActivated).toBe(false)
    await expect(service.getSpans('topic', 'trace')).resolves.toEqual([])
    await expect(service.saveSpans('topic')).resolves.toBeUndefined()
  })
})
