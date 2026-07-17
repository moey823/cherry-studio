import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Hyperlink from '../Hyperlink'

describe('Hyperlink privacy behavior', () => {
  it('renders its content without fetching link metadata', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    render(
      <Hyperlink href="https://example.com/private-path">
        <span>Example link</span>
      </Hyperlink>
    )

    expect(screen.getByText('Example link')).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
