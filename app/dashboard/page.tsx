"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { MoodChart } from "@/components/charts/mood-chart"
import { ActivityChart } from "@/components/charts/activity-chart"
import { TopicsChart } from "@/components/charts/topics-chart"
import { TagCloud } from "@/components/charts/tag-cloud"
import { TimelineChart } from "@/components/charts/timeline-chart"
import { ClockIcon, BarChart2Icon, PieChartIcon, TagIcon } from "lucide-react"

interface AnalyticsData {
  moodDistribution: Array<{ mood: string; count: number }>
  entriesPerDayOfWeek: Array<{ day_of_week: number; count: number }>
  entriesPerMonth: Array<{ month: number; count: number }>
  topTopics: Array<{ name: string; total_percentage: number; entry_count: number }>
  topTags: Array<{ name: string; count: number }>
  entriesOverTime: Array<{ date: string; count: number }>
  avgLength: number
  totalTime: string
}

export default function DashboardPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/analytics")
        if (!response.ok) throw new Error("Failed to fetch analytics")

        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [toast])

  // Format total time from interval to readable format
  const formatTotalTime = (timeString: string) => {
    if (!timeString || timeString === "0") return "0 minutes"

    // Parse PostgreSQL interval format
    const matches = timeString.match(/(?:(\d+):)?(\d+):(\d+)/)
    if (matches) {
      const [, hours = "0", minutes, seconds] = matches
      return `${Number.parseInt(hours)}h ${Number.parseInt(minutes)}m ${Number.parseInt(seconds)}s`
    }

    return timeString
  }

  // Get day name from day of week number
  const getDayName = (dayNum: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return days[dayNum]
  }

  // Get month name from month number
  const getMonthName = (monthNum: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[monthNum - 1]
  }

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
              <p className="text-muted-foreground mb-4">
                Start journaling to see analytics and insights about your entries.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare data for charts
  const moodData = analyticsData.moodDistribution.map((item) => ({
    name: item.mood.charAt(0).toUpperCase() + item.mood.slice(1),
    value: Number.parseInt(item.count as unknown as string),
  }))

  const dayOfWeekData = Array(7)
    .fill(0)
    .map((_, i) => {
      const found = analyticsData.entriesPerDayOfWeek.find(
        (item) => Number.parseInt(item.day_of_week as unknown as string) === i,
      )
      return {
        name: getDayName(i),
        value: found ? Number.parseInt(found.count as unknown as string) : 0,
      }
    })

  const monthData = Array(12)
    .fill(0)
    .map((_, i) => {
      const found = analyticsData.entriesPerMonth.find(
        (item) => Number.parseInt(item.month as unknown as string) === i + 1,
      )
      return {
        name: getMonthName(i + 1),
        value: found ? Number.parseInt(found.count as unknown as string) : 0,
      }
    })

  const topicsData = analyticsData.topTopics.map((item) => ({
    name: item.name,
    value:
      Number.parseFloat(item.total_percentage as unknown as string) /
      Number.parseInt(item.entry_count as unknown as string),
  }))

  const tagsData = analyticsData.topTags.map((item) => ({
    name: item.name,
    value: Number.parseInt(item.count as unknown as string),
  }))

  const timelineData = analyticsData.entriesOverTime.map((item) => ({
    date: item.date,
    count: Number.parseInt(item.count as unknown as string),
  }))

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Analytics and insights from your journal entries</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <BarChart2Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.moodDistribution.reduce(
                  (acc, curr) => acc + Number.parseInt(curr.count as unknown as string),
                  0,
                )}
              </div>
              <p className="text-xs text-muted-foreground">Journal entries recorded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Length</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analyticsData.avgLength / 5)}</div>
              <p className="text-xs text-muted-foreground">Words per entry (approx.)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recording Time</CardTitle>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTotalTime(analyticsData.totalTime)}</div>
              <p className="text-xs text-muted-foreground">Time spent journaling</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Tags</CardTitle>
              <TagIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.topTags.length}</div>
              <p className="text-xs text-muted-foreground">Different topics covered</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mood">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="mood">Mood</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="mood">
            <Card>
              <CardHeader>
                <CardTitle>Mood Distribution</CardTitle>
                <CardDescription>Breakdown of your emotional states across journal entries</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <MoodChart data={moodData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Journaling Activity</CardTitle>
                <CardDescription>When you journal the most</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="day">
                  <TabsList className="mb-4">
                    <TabsTrigger value="day">Day of Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                  <TabsContent value="day" className="h-[400px]">
                    <ActivityChart data={dayOfWeekData} />
                  </TabsContent>
                  <TabsContent value="month" className="h-[400px]">
                    <ActivityChart data={monthData} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics">
            <Card>
              <CardHeader>
                <CardTitle>Top Topics</CardTitle>
                <CardDescription>Main themes detected in your journal entries</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <TopicsChart data={topicsData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags">
            <Card>
              <CardHeader>
                <CardTitle>Tag Cloud</CardTitle>
                <CardDescription>Most frequently used tags in your journal</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <TagCloud data={tagsData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Journaling Timeline</CardTitle>
                <CardDescription>Your journaling activity over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <TimelineChart data={timelineData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

