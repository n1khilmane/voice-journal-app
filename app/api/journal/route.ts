import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const tag = searchParams.get("tag") || ""

    const offset = (page - 1) * limit

    let query = `
      SELECT 
        je.id, je.title, je.transcription, je.audio_url, je.duration, 
        je.mood, je.created_at, je.updated_at, je.user_id
      FROM journal_entries je
      WHERE je.user_id = $1
    `

    const queryParams = [session.user.id]
    let paramIndex = 2

    if (search) {
      query += ` AND (je.title ILIKE $${paramIndex} OR je.transcription ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (tag) {
      query += `
        AND je.id IN (
          SELECT et.entry_id 
          FROM entry_tags et 
          JOIN tags t ON et.tag_id = t.id 
          WHERE t.name = $${paramIndex}
        )
      `
      queryParams.push(tag)
      paramIndex++
    }

    query += ` ORDER BY je.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    queryParams.push(limit, offset)

    const entries = await db.query.raw(query, queryParams)

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM journal_entries je
      WHERE je.user_id = $1
    `

    const countParams = [session.user.id]
    paramIndex = 2

    if (search) {
      countQuery += ` AND (je.title ILIKE $${paramIndex} OR je.transcription ILIKE $${paramIndex})`
      countParams.push(`%${search}%`)
      paramIndex++
    }

    if (tag) {
      countQuery += `
        AND je.id IN (
          SELECT et.entry_id 
          FROM entry_tags et 
          JOIN tags t ON et.tag_id = t.id 
          WHERE t.name = $${paramIndex}
        )
      `
      countParams.push(tag)
    }

    const [countResult] = await db.query.raw(countQuery, countParams)

    // Get tags for each entry
    const entriesWithTags = await Promise.all(
      entries.map(async (entry) => {
        const tags = await db.query.raw(
          `
        SELECT t.name
        FROM tags t
        JOIN entry_tags et ON t.id = et.tag_id
        WHERE et.entry_id = $1
      `,
          [entry.id],
        )

        return {
          ...entry,
          tags: tags.map((tag: any) => tag.name),
        }
      }),
    )

    return NextResponse.json({
      entries: entriesWithTags,
      total: Number.parseInt(countResult.total),
      page,
      limit,
      totalPages: Math.ceil(Number.parseInt(countResult.total) / limit),
    })
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 })
  }
}

