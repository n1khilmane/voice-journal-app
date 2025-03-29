import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the Neon database
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Helper function to format journal entry data
export function formatJournalEntry(entry: any) {
  return {
    id: entry.id,
    title: entry.title,
    transcription: entry.transcription,
    audioUrl: entry.audio_url,
    duration: entry.duration,
    mood: entry.mood,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
    userId: entry.user_id,
  }
}

