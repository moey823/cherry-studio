import type { Citation } from '@renderer/types/message'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../../MessageListProvider', () => ({
  useOptionalMessageListActions: () => undefined
}))

import { CitationsPanelContent } from '../CitationsList'

describe('CitationsList privacy behavior', () => {
  it('uses only citation content already present in the response', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const citations: Citation[] = [
      {
        number: 1,
        url: 'https://example.com/private',
        title: 'Example',
        content: 'Content supplied by the model',
        type: 'websearch'
      }
    ]

    render(<CitationsPanelContent citations={citations} />)

    expect(screen.getByText('Content supplied by the model')).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
