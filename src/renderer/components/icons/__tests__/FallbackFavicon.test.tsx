import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import FallbackFavicon from '../FallbackFavicon'

describe('FallbackFavicon privacy behavior', () => {
  it('renders a local monogram without fetching a favicon', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    render(<FallbackFavicon hostname="example.com" alt="Example" />)

    expect(screen.getByRole('img', { name: 'Example' })).toHaveTextContent('E')
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
