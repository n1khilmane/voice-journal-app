"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { JournalEntryList } from "@/components/journal-entry-list"
import { useToast } from "@/hooks/use-toast"

interface JournalStats {
  totalEntries: number
  entriesThisWeek: number
  currentStreak: number
}

export default function JournalPage() {
  const [stats, setStats] = useState<JournalStats | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/journal/stats")
        if (!response.ok) throw new Error("Failed to fetch stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching journal stats:", error)
        toast({
          title: "Error",
          description: "Failed to load journal statistics. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchStats()
  }, [toast])

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Journal</h1>
          <p className="text-muted-foreground">View and manage your voice journal entries</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Entries</CardTitle>
              <CardDescription>Your journaling progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalEntries || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>This Week</CardTitle>
              <CardDescription>Entries in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.entriesThisWeek || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Streak</CardTitle>
              <CardDescription>Consecutive days journaling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.currentStreak || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>Browse through your past journal entries</CardDescription>
          </CardHeader>
          <CardContent>
            <JournalEntryList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

