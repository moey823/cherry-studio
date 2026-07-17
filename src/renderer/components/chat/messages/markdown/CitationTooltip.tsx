import { Tooltip } from '@cherrystudio/ui'
import Favicon from '@renderer/components/icons/FallbackFavicon'
import MarqueeText from '@renderer/components/MarqueeText'
import React, { memo, useCallback, useMemo } from 'react'
import * as z from 'zod'

import { useOptionalMessageListActions } from '../MessageListProvider'

export const CitationSchema = z.object({
  url: z.url(),
  title: z.string().optional(),
  content: z.string().optional()
})

interface CitationTooltipProps {
  children: React.ReactNode
  citation: z.infer<typeof CitationSchema>
}

const CitationTooltip: React.FC<CitationTooltipProps> = ({ children, citation }) => {
  const openExternalUrl = useOptionalMessageListActions()?.openExternalUrl
  const hostname = useMemo(() => {
    try {
      return new URL(citation.url).hostname
    } catch {
      return citation.url
    }
  }, [citation.url])

  const sourceTitle = citation.title?.trim() || hostname
  const displayContent = citation.content?.trim() || undefined

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!openExternalUrl) return
      event.preventDefault()
      void openExternalUrl(citation.url)
    },
    [citation.url, openExternalUrl]
  )

  // 自定义悬浮卡片内容
  const tooltipContent = useMemo(
    () => (
      <div style={{ userSelect: 'text' }}>
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2 flex cursor-pointer items-center gap-2 hover:opacity-80"
          aria-label={`Open ${sourceTitle} in new tab`}
          onClick={handleClick}>
          <Favicon hostname={hostname} alt={sourceTitle} />
          <div
            className="overflow-hidden text-ellipsis whitespace-nowrap text-foreground text-sm leading-[1.4]"
            role="heading"
            aria-level={3}
            title={sourceTitle}>
            <MarqueeText>{sourceTitle}</MarqueeText>
          </div>
        </a>
        {displayContent && (
          <div
            className="mb-2 overflow-hidden text-[13px] text-foreground-secondary leading-normal [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [display:-webkit-box]"
            role="article"
            aria-label="Citation content"
            style={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3
            }}>
            {displayContent}
          </div>
        )}
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-primary text-xs hover:underline"
          aria-label={`Visit ${hostname}`}
          onClick={handleClick}>
          {hostname}
        </a>
      </div>
    ),
    [citation.url, displayContent, hostname, handleClick, sourceTitle]
  )

  return (
    <Tooltip
      content={tooltipContent}
      showArrow={false}
      className="rounded-[8px] border border-border bg-card p-3 text-foreground dark:bg-card dark:text-foreground">
      {children}
    </Tooltip>
  )
}

export default memo(CitationTooltip)
