import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MicIcon, BookOpenIcon, SparklesIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Voice <span className="text-primary">Journal</span>
        </h1>
        <p className="mt-6 text-xl text-muted-foreground">
          Speak your thoughts, get AI-powered insights, and track your personal growth journey.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
          <Link href="/record">
            <Button size="lg" className="gap-2">
              <MicIcon className="h-5 w-5" />
              Start Recording
            </Button>
          </Link>
          <Link href="/journal">
            <Button size="lg" variant="outline" className="gap-2">
              <BookOpenIcon className="h-5 w-5" />
              View Journal
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<MicIcon className="h-8 w-8" />}
            title="Voice Recording"
            description="Easily record your thoughts with our intuitive voice recorder"
          />
          <FeatureCard
            icon={<BookOpenIcon className="h-8 w-8" />}
            title="Transcription"
            description="Automatically convert your voice to text with high accuracy"
          />
          <FeatureCard
            icon={<SparklesIcon className="h-8 w-8" />}
            title="AI Insights"
            description="Get personalized insights and patterns from your journal entries"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm border">
      <div className="p-3 rounded-full bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 text-xl font-medium">{title}</h3>
      <p className="mt-2 text-center text-muted-foreground">{description}</p>
    </div>
  )
}

