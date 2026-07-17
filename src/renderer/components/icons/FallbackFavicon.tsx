import type { FC } from 'react'

interface FallbackFaviconProps {
  hostname: string
  alt: string
}

/** A local monogram avoids contacting the cited site or a favicon proxy. */
const FallbackFavicon: FC<FallbackFaviconProps> = ({ hostname, alt }) => (
  <div
    role="img"
    aria-label={alt}
    className="flex h-4 w-4 items-center justify-center rounded-[4px] bg-primary/15 font-bold text-[10px] text-primary">
    {hostname.charAt(0).toUpperCase() || '?'}
  </div>
)

export default FallbackFavicon
