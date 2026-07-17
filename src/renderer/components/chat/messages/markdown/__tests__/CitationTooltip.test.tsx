import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@cherrystudio/ui', () => ({
  Tooltip: ({ children, content }: { children: ReactNode; content: ReactNode }) => (
    <div>
      {children}
      <div data-testid="tooltip-content">{content}</div>
    </div>
  )
}))

vi.mock('../../MessageListProvider', () => ({
  useOptionalMessageListActions: () => undefined
}))

import CitationTooltip from '../CitationTooltip'

describe('CitationTooltip privacy behavior', () => {
  it('shows supplied metadata without requesting oEmbed or page content', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    render(
      <CitationTooltip
        citation={{
          url: 'https://example.com/article',
          title: 'Example Article',
          content: 'Content supplied by the model'
        }}>
        <span>Trigger</span>
      </CitationTooltip>
    )

    expect(screen.getByTestId('tooltip-content')).toHaveTextContent('Example Article')
    expect(screen.getByTestId('tooltip-content')).toHaveTextContent('Content supplied by the model')
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
