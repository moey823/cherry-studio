import React, { memo } from 'react'

interface HyperLinkProps {
  children: React.ReactNode
  href: string
}

/**
 * Link previews are intentionally local-only. The surrounding Link component
 * owns navigation; this wrapper must not fetch the destination on hover.
 */
const Hyperlink: React.FC<HyperLinkProps> = ({ children }) => <>{children}</>

export default memo(Hyperlink)
