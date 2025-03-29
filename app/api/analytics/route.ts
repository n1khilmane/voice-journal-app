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

    // Get mood distribution
    const moodDistribution = await db.query.raw(
      `
      SELECT mood, COUNT(*) as count
      FROM journal_entries
      WHERE user_id = $1
      GROUP BY mood
      ORDER BY count DESC
    `,
      [session.user.id],
    )

    // Get entries per day of week
    const entriesPerDayOfWeek = await db.query.raw(
      `
      SELECT 
        EXTRACT(DOW FROM created_at) as day_of_week,
        COUNT(*) as count
      FROM journal_entries
      WHERE user_id = $1
      GROUP BY day_of_week
      ORDER BY day_of_week
    `,
      [session.user.id],
    )

    // Get entries per month
    const entriesPerMonth = await db.query.raw(
      `
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        COUNT(*) as count
      FROM journal_entries
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '1 year'
      GROUP BY month
      ORDER BY month
    `,
      [session.user.id],
    )

    // Get top topics
    const topTopics = await db.query.raw(
      `
      SELECT name, SUM(percentage) as total_percentage, COUNT(*) as entry_count
      FROM topics t
      JOIN journal_entries je ON t.entry_id = je.id
      WHERE je.user_id = $1
      GROUP BY name
      ORDER BY total_percentage DESC
      LIMIT 10
    `,
      [session.user.id],
    )

    // Get top tags
    const topTags = await db.query.raw(
      `
      SELECT t.name, COUNT(*) as count
      FROM tags t
      JOIN entry_tags et ON t.id = et.tag_id
      JOIN journal_entries je ON et.entry_id = je.id
      WHERE je.user_id = $1
      GROUP BY t.name
      ORDER BY count DESC
      LIMIT 10
    `,
      [session.user.id],
    )

    // Get entries over time (last 30 days)
    const entriesOverTime = await db.query.raw(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM journal_entries
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date
    `,
      [session.user.id],
    )

    // Get average entry length
    const [avgLength] = await db.query.raw(
      `
      SELECT AVG(LENGTH(transcription)) as avg_length
      FROM journal_entries
      WHERE user_id = $1
    `,
      [session.user.id],
    )

    // Get total recording time
    const [totalTime] = await db.query.raw(
      `
      SELECT 
        SUM(
          CASE 
            WHEN duration LIKE '%:%' THEN 
              (EXTRACT(EPOCH FROM (CONCAT('00:', duration))::time) * INTERVAL '1 second')
            ELSE 
              (duration::numeric * INTERVAL '1 second')
          END
        ) as total_time
      FROM journal_entries
      WHERE user_id = $1
    `,
      [session.user.id],
    )

    return NextResponse.json({
      moodDistribution,
      entriesPerDayOfWeek,
      entriesPerMonth,
      topTopics,
      topTags,
      entriesOverTime,
      avgLength: avgLength ? Number.parseFloat(avgLength.avg_length) : 0,
      totalTime: totalTime?.total_time || "0",
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

