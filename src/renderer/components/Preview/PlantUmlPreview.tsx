import React, { memo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import ImagePreviewLayout from './ImagePreviewLayout'
import { ShadowWhiteContainer } from './styles'
import type { BasicPreviewHandles, BasicPreviewProps } from './types'

const PlantUmlPreview = ({
  enableToolbar = false,
  ref
}: BasicPreviewProps & { ref?: React.RefObject<BasicPreviewHandles | null> }) => {
  const { t } = useTranslation()
  const imageRef = useRef<HTMLDivElement>(null)

  return (
    <ImagePreviewLayout
      loading={false}
      error={t('preview.plantuml_privacy_disabled')}
      enableToolbar={enableToolbar}
      ref={ref}
      imageRef={imageRef}
      source="plantuml">
      <ShadowWhiteContainer ref={imageRef} className="plantuml-preview special-preview" />
    </ImagePreviewLayout>
  )
}

export default memo(PlantUmlPreview)
