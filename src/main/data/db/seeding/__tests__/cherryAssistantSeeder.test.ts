import { agentTable } from '@data/db/schemas/agent'
import { seeders } from '@data/db/seeding/seederRegistry'
import { CherryAssistantSeeder } from '@data/db/seeding/seeders/cherryAssistantSeeder'
import { setupTestDatabase } from '@test-helpers/db'
import { sql } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

describe('CherryAssistantSeeder privacy behavior', () => {
  const dbh = setupTestDatabase()

  it('does not register a managed CherryAI provider/model seeder', () => {
    expect(seeders.map((seeder) => seeder.name)).not.toContain('cherryAiDefaultModel')
  })

  it('creates the builtin agent without a selected model', () => {
    new CherryAssistantSeeder().run(dbh.db)

    const [agent] = dbh.db
      .select()
      .from(agentTable)
      .where(sql`json_extract(${agentTable.configuration}, '$.builtin_role') = 'assistant'`)
      .all()

    expect(agent).toMatchObject({ name: 'Cherry Assistant', model: null })
  })
})
