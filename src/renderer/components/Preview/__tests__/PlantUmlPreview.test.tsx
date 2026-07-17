import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const { imagePreviewLayout } = vi.hoisted(() => ({
  imagePreviewLayout: vi.fn(({ children, error, loading, source }) => (
    <div data-testid="image-preview-layout" data-loading={String(loading)} data-source={source}>
      <div data-testid="error">{error}</div>
      {children}
    </div>
  ))
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

vi.mock('@renderer/components/Preview/ImagePreviewLayout', () => ({
  default: imagePreviewLayout
}))

import PlantUmlPreview from '../PlantUmlPreview'

describe('PlantUmlPreview privacy behavior', () => {
  it('does not render or request a remote diagram', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    render(<PlantUmlPreview>{'@startuml\nA -> B\n@enduml'}</PlantUmlPreview>)

    expect(screen.getByTestId('error')).toHaveTextContent('preview.plantuml_privacy_disabled')
    expect(screen.getByTestId('image-preview-layout')).toHaveAttribute('data-loading', 'false')
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
