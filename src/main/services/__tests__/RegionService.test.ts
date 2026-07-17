import { describe, expect, it, vi } from 'vitest'

import { regionService } from '../RegionService'

describe('RegionService privacy behavior', () => {
  it('returns a stable local default without geolocating the user', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    await expect(regionService.getCountry()).resolves.toBe('US')
    await expect(regionService.isInChina()).resolves.toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
