"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JournalEntry {
  id: number
  title: string
  transcription: string
  audioUrl: string
  duration: string
  mood: string
  createdAt: string
  tags: string[]
}

export function JournalEntryList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [tags, setTags] = useState<{ name: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch tags
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags")
        if (!response.ok) throw new Error("Failed to fetch tags")
        const data = await response.json()
        setTags(data.tags)
      } catch (error) {
        console.error("Error fetching tags:", error)
        toast({
          title: "Error",
          description: "Failed to load tags. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchTags()
  }, [toast])

  useEffect(() => {
    // Fetch entries with search and tag filters
    const fetchEntries = async () => {
      setIsLoading(true)
      try {
        let url = `/api/journal?page=${page}&limit=10`

        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`
        }

        if (selectedTag) {
          url += `&tag=${encodeURIComponent(selectedTag)}`
        }

        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch entries")

        const data = await response.json()
        setEntries(data.entries)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error("Error fetching entries:", error)
        toast({
          title: "Error",
          description: "Failed to load journal entries. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search queries
    const timer = setTimeout(() => {
      fetchEntries()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedTag, page, toast])

  const getPreview = (transcription: string) => {
    return transcription.length > 150 ? transcription.substring(0, 150) + "..." : transcription
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search entries..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1) // Reset to first page on new search
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.name}
              variant={selectedTag === tag.name ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setSelectedTag(selectedTag === tag.name ? null : tag.name)
                setPage(1) // Reset to first page on tag selection
              }}
            >
              {tag.name} ({tag.count})
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No journal entries found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Link href={`/journal/${entry.id}`} key={entry.id}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{entry.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{getPreview(entry.transcription)}</p>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-1 flex-wrap">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">{entry.duration}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

