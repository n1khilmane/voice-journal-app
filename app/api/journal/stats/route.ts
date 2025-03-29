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

    // Get total entries
    const [totalResult] = await db.query.raw(
      `
      SELECT COUNT(*) as total
      FROM journal_entries
      WHERE user_id = $1
    `,
      [session.user.id],
    )

    // Get entries from the last 7 days
    const [weekResult] = await db.query.raw(
      `
      SELECT COUNT(*) as total
      FROM journal_entries
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
    `,
      [session.user.id],
    )

    // Calculate current streak
    const streakResult = await db.query.raw(
      `
      WITH daily_entries AS (
        SELECT DISTINCT DATE(created_at) as entry_date
        FROM journal_entries
        WHERE user_id = $1
        ORDER BY entry_date DESC
      ),
      streak_calc AS (
        SELECT 
          entry_date,
          DATE(entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date DESC) - 1)) as streak_group
        FROM daily_entries
      )
      SELECT COUNT(*) as current_streak
      FROM streak_calc
      WHERE streak_group = (SELECT MAX(streak_group) FROM streak_calc)
    `,
      [session.user.id],
    )

    return NextResponse.json({
      totalEntries: Number.parseInt(totalResult.total),
      entriesThisWeek: Number.parseInt(weekResult.total),
      currentStreak: Number.parseInt(streakResult[0].current_streak),
    })
  } catch (error) {
    console.error("Error fetching journal stats:", error)
    return NextResponse.json({ error: "Failed to fetch journal statistics" }, { status: 500 })
  }
}

