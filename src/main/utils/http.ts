export const defaultAppHeaders = () => {
  // Provider requests must not advertise the desktop client or create an
  // attribution trail unless the user adds those headers explicitly.
  return {}
}

/**
 * Checks whether a string is a valid HTTP(S) URL.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}
