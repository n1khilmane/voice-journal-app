import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Insight {
  id: number
  title: string
  description: string
}

interface Topic {
  name: string
  percentage: number
}

interface InsightsPanelProps {
  insights: Insight[]
  topics: Topic[]
}

export function InsightsPanel({ insights, topics }: InsightsPanelProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
          <CardDescription>Analysis of your journal entry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights && insights.length > 0 ? (
            insights.map((insight) => (
              <div key={insight.id} className="space-y-1">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No insights available for this entry.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Topics</CardTitle>
          <CardDescription>Main themes in your journal entry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topics && topics.length > 0 ? (
            topics.map((topic) => (
              <div key={topic.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{topic.name}</span>
                  <span>{topic.percentage}%</span>
                </div>
                <Progress value={topic.percentage} className="h-2" />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No topics available for this entry.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

