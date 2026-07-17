/**
 * Privacy build: never geolocate the user's public IP.
 *
 * Callers that need a regional default receive a stable, local value instead.
 * Users can still choose mirrors/endpoints explicitly in their settings.
 */
class RegionService {
  async getCountry(): Promise<string> {
    return 'US'
  }

  async isInChina(): Promise<boolean> {
    return false
  }
}

export const regionService = new RegionService()
