import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Get the journal entry
    const [entry] = await db.query.raw(
      `
      SELECT 
        je.id, je.title, je.transcription, je.audio_url, je.duration, 
        je.mood, je.created_at, je.updated_at, je.user_id
      FROM journal_entries je
      WHERE je.id = $1 AND je.user_id = $2
    `,
      [id, session.user.id],
    )

    if (!entry) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 })
    }

    // Get tags for the entry
    const tags = await db.query.raw(
      `
      SELECT t.name
      FROM tags t
      JOIN entry_tags et ON t.id = et.tag_id
      WHERE et.entry_id = $1
    `,
      [id],
    )

    // Get insights for the entry
    const insights = await db.query.raw(
      `
      SELECT id, title, description
      FROM insights
      WHERE entry_id = $1
    `,
      [id],
    )

    // Get topics for the entry
    const topics = await db.query.raw(
      `
      SELECT name, percentage
      FROM topics
      WHERE entry_id = $1
    `,
      [id],
    )

    return NextResponse.json({
      ...entry,
      tags: tags.map((tag: any) => tag.name),
      insights,
      topics,
    })
  } catch (error) {
    console.error("Error fetching journal entry:", error)
    return NextResponse.json({ error: "Failed to fetch journal entry" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const { title, transcription, mood, tags } = await request.json()

    // Check if the entry exists and belongs to the user
    const [entry] = await db.query.raw(
      `
      SELECT id FROM journal_entries
      WHERE id = $1 AND user_id = $2
    `,
      [id, session.user.id],
    )

    if (!entry) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 })
    }

    // Update the journal entry
    await db.query.raw(
      `
      UPDATE journal_entries
      SET title = $1, transcription = $2, mood = $3, updated_at = NOW()
      WHERE id = $4
    `,
      [title, transcription, mood, id],
    )

    // Handle tags
    if (tags && Array.isArray(tags)) {
      // Delete existing tags
      await db.query.raw(
        `
        DELETE FROM entry_tags
        WHERE entry_id = $1
      `,
        [id],
      )

      // Add new tags
      for (const tagName of tags) {
        // Check if tag exists, if not create it
        let [tag] = await db.query.raw(
          `
          SELECT id FROM tags WHERE name = $1
        `,
          [tagName],
        )

        if (!tag) {
          ;[tag] = await db.query.raw(
            `
            INSERT INTO tags (name) VALUES ($1) RETURNING id
          `,
            [tagName],
          )
        }

        // Link tag to entry
        await db.query.raw(
          `
          INSERT INTO entry_tags (entry_id, tag_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `,
          [id, tag.id],
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating journal entry:", error)
    return NextResponse.json({ error: "Failed to update journal entry" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Check if the entry exists and belongs to the user
    const [entry] = await db.query.raw(
      `
      SELECT id FROM journal_entries
      WHERE id = $1 AND user_id = $2
    `,
      [id, session.user.id],
    )

    if (!entry) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 })
    }

    // Delete related data first (foreign key constraints)
    await db.query.raw(`DELETE FROM entry_tags WHERE entry_id = $1`, [id])
    await db.query.raw(`DELETE FROM insights WHERE entry_id = $1`, [id])
    await db.query.raw(`DELETE FROM topics WHERE entry_id = $1`, [id])

    // Delete the journal entry
    await db.query.raw(`DELETE FROM journal_entries WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting journal entry:", error)
    return NextResponse.json({ error: "Failed to delete journal entry" }, { status: 500 })
  }
}

