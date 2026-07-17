import { mockMainLoggerService } from '@test-mocks/MainLoggerService'
import { beforeEach, describe, expect, it } from 'vitest'

import { transformLlmModelIds } from '../LlmModelTransforms'

describe('LlmModelTransforms', () => {
  beforeEach(() => {
    mockMainLoggerService.warn.mockClear()
  })

  describe('transformLlmModelIds', () => {
    it('transforms all 4 model fields to UniqueModelIds', () => {
      const sources = {
        defaultModel: { id: 'gpt-4', provider: 'openai', name: 'GPT-4' },
        topicNamingModel: { id: 'gpt-3.5-turbo', provider: 'openai', name: 'GPT-3.5' },
        quickModel: { id: 'claude-3-haiku', provider: 'anthropic', name: 'Haiku' },
        translateModel: { id: 'qwen-max', provider: 'qwen', name: 'Qwen Max' }
      }

      const result = transformLlmModelIds(sources)

      expect(result).toEqual({
        'chat.default_model_id': 'openai::gpt-4',
        'topic.naming.model_id': 'openai::gpt-3.5-turbo',
        'feature.quick_assistant.model_id': 'anthropic::claude-3-haiku',
        'feature.translate.model_id': 'qwen::qwen-max'
      })
    })

    it('leaves model preferences unconfigured when model objects are missing', () => {
      const result = transformLlmModelIds({})

      expect(result).toEqual({
        'chat.default_model_id': null,
        'topic.naming.model_id': null,
        'feature.quick_assistant.model_id': null,
        'feature.translate.model_id': null
      })
    })

    it('handles mix of valid and missing models', () => {
      const sources = {
        defaultModel: { id: 'gpt-4', provider: 'openai' },
        topicNamingModel: null
        // quickModel and translateModel not present
      }

      const result = transformLlmModelIds(sources)

      expect(result['chat.default_model_id']).toBe('openai::gpt-4')
      expect(result['topic.naming.model_id']).toBeNull()
      expect(result['feature.quick_assistant.model_id']).toBeNull()
      expect(result['feature.translate.model_id']).toBeNull()
    })

    it('handles model with incomplete data (missing provider)', () => {
      const sources = {
        defaultModel: { id: 'gpt-4' }, // no provider
        topicNamingModel: { provider: 'openai' } // no id
      }

      const result = transformLlmModelIds(sources)

      expect(result['chat.default_model_id']).toBeNull()
      expect(result['topic.naming.model_id']).toBeNull()
    })

    it('uses shared model conversion behavior for passthrough, trimming, and invalid providers', () => {
      const result = transformLlmModelIds({
        defaultModel: { id: ' openai::gpt-4 ', provider: 'openai' },
        topicNamingModel: { id: ' gpt-4o-mini ', provider: ' openai ' },
        quickModel: { id: 'gpt-4', provider: 'o::p' },
        translateModel: 'not-an-object'
      })

      expect(result).toEqual({
        'chat.default_model_id': 'openai::gpt-4',
        'topic.naming.model_id': 'openai::gpt-4o-mini',
        'feature.quick_assistant.model_id': null,
        'feature.translate.model_id': null
      })
      expect(mockMainLoggerService.warn).toHaveBeenCalledWith(
        'Legacy model preference could not be parsed; leaving it unconfigured',
        {
          preferenceKey: 'feature.quick_assistant.model_id',
          valueType: 'object',
          id: 'gpt-4',
          provider: 'o::p'
        }
      )
      expect(mockMainLoggerService.warn).toHaveBeenCalledWith(
        'Legacy model preference could not be parsed; leaving it unconfigured',
        {
          preferenceKey: 'feature.translate.model_id',
          valueType: 'string'
        }
      )
    })

    it('preserves explicitly configured legacy CherryAI model references', () => {
      const result = transformLlmModelIds({
        defaultModel: { id: 'old-default', provider: 'cherryai' },
        topicNamingModel: { id: 'old-topic', provider: 'cherryai' },
        quickModel: { id: 'old-quick', provider: 'cherryai' },
        translateModel: { id: 'old-translate', provider: 'cherryai' }
      })

      expect(result).toEqual({
        'chat.default_model_id': 'cherryai::old-default',
        'topic.naming.model_id': 'cherryai::old-topic',
        'feature.quick_assistant.model_id': 'cherryai::old-quick',
        'feature.translate.model_id': 'cherryai::old-translate'
      })
    })

    it('trims legacy CherryAI provider ids while preserving the selected models', () => {
      const result = transformLlmModelIds({
        defaultModel: { id: 'old-default', provider: ' cherryai ' },
        topicNamingModel: { id: 'old-topic', provider: '\tcherryai\n' }
      })

      expect(result['chat.default_model_id']).toBe('cherryai::old-default')
      expect(result['topic.naming.model_id']).toBe('cherryai::old-topic')
    })
  })
})
