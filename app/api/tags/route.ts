import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all tags with count of entries for the current user
    const tags = await db.query.raw(
      `
      SELECT t.name, COUNT(et.entry_id) as count
      FROM tags t
      JOIN entry_tags et ON t.id = et.tag_id
      JOIN journal_entries je ON et.entry_id = je.id
      WHERE je.user_id = $1
      GROUP BY t.name
      ORDER BY count DESC, t.name ASC
    `,
      [session.user.id],
    )

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
}

