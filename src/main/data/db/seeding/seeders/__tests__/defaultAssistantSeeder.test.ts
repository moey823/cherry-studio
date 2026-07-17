import { assistantTable } from '@data/db/schemas/assistant'
import { messageTable } from '@data/db/schemas/message'
import { topicTable } from '@data/db/schemas/topic'
import { userModelTable } from '@data/db/schemas/userModel'
import { userProviderTable } from '@data/db/schemas/userProvider'
import { DefaultAssistantSeeder } from '@data/db/seeding/seeders/defaultAssistantSeeder'
import { DEFAULT_ASSISTANT_SETTINGS } from '@shared/data/types/assistant'
import { setupTestDatabase } from '@test-helpers/db'
import { eq } from 'drizzle-orm'
import { app } from 'electron'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('DefaultAssistantSeeder privacy behavior', () => {
  const dbh = setupTestDatabase()

  beforeEach(() => {
    vi.mocked(app.getPreferredSystemLanguages).mockReturnValue(['en-US'])
  })

  it('creates an empty chat without seeding or selecting a provider model', async () => {
    new DefaultAssistantSeeder().run(dbh.db)

    const [assistant] = await dbh.db.select().from(assistantTable).limit(1)
    const [topic] = await dbh.db.select().from(topicTable).limit(1)
    const messages = await dbh.db.select().from(messageTable).where(eq(messageTable.topicId, topic.id))

    expect(assistant).toMatchObject({
      name: 'Cherry Assistant',
      modelId: null,
      settings: DEFAULT_ASSISTANT_SETTINGS
    })
    expect(messages).toHaveLength(1)
    expect(await dbh.db.select().from(userProviderTable)).toEqual([])
    expect(await dbh.db.select().from(userModelTable)).toEqual([])
  })
})
