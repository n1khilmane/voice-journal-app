"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { InsightsPanel } from "@/components/insights-panel"
import { useToast } from "@/hooks/use-toast"
import { PlayIcon, PauseIcon, EditIcon, TrashIcon, SaveIcon, XIcon } from "lucide-react"

interface JournalEntry {
  id: number
  title: string
  transcription: string
  audio_url: string
  duration: string
  mood: string
  created_at: string
  updated_at: string
  tags: string[]
  insights: Array<{
    id: number
    title: string
    description: string
  }>
  topics: Array<{
    name: string
    percentage: number
  }>
}

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [editedEntry, setEditedEntry] = useState<{
    title: string
    transcription: string
    mood: string
    tags: string
  }>({
    title: "",
    transcription: "",
    mood: "",
    tags: "",
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchEntry = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/journal/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/journal")
            return
          }
          throw new Error("Failed to fetch entry")
        }

        const data = await response.json()
        setEntry(data)
        setEditedEntry({
          title: data.title,
          transcription: data.transcription,
          mood: data.mood,
          tags: data.tags.join(", "),
        })
      } catch (error) {
        console.error("Error fetching journal entry:", error)
        toast({
          title: "Error",
          description: "Failed to load journal entry. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntry()
  }, [params.id, router, toast])

  useEffect(() => {
    // Set up audio player
    if (entry?.audio_url) {
      audioRef.current = new Audio(entry.audio_url)

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false)
      })

      return () => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.removeEventListener("ended", () => {
            setIsPlaying(false)
          })
        }
      }
    }
  }, [entry?.audio_url])

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }

    setIsPlaying(!isPlaying)
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/journal/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editedEntry.title,
          transcription: editedEntry.transcription,
          mood: editedEntry.mood,
          tags: editedEntry.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        }),
      })

      if (!response.ok) throw new Error("Failed to update entry")

      // Refresh the entry data
      const updatedResponse = await fetch(`/api/journal/${params.id}`)
      if (!updatedResponse.ok) throw new Error("Failed to fetch updated entry")

      const updatedData = await updatedResponse.json()
      setEntry(updatedData)

      setIsEditing(false)
      toast({
        title: "Success",
        description: "Journal entry updated successfully.",
      })
    } catch (error) {
      console.error("Error updating journal entry:", error)
      toast({
        title: "Error",
        description: "Failed to update journal entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/journal/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete entry")

      router.push("/journal")
      toast({
        title: "Success",
        description: "Journal entry deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Entry Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The journal entry you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push("/journal")}>Back to Journal</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => router.push("/journal")}>
            Back to Journal
          </Button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <XIcon className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your journal entry and all associated
                        data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                {isEditing ? (
                  <Input
                    value={editedEntry.title}
                    onChange={(e) => setEditedEntry({ ...editedEntry, title: e.target.value })}
                    className="text-xl font-bold"
                  />
                ) : (
                  <CardTitle>{entry.title}</CardTitle>
                )}
                <CardDescription>
                  {format(new Date(entry.created_at), "MMMM d, yyyy")} (
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entry.audio_url && (
                  <div className="mb-4 flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0" onClick={togglePlayback}>
                      {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                    </Button>
                    <span className="text-sm text-muted-foreground">{entry.duration}</span>
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editedEntry.transcription}
                      onChange={(e) => setEditedEntry({ ...editedEntry, transcription: e.target.value })}
                      className="min-h-[200px]"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mood</label>
                        <Select
                          value={editedEntry.mood}
                          onValueChange={(value) => setEditedEntry({ ...editedEntry, mood: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select mood" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="negative">Negative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tags (comma separated)</label>
                        <Input
                          value={editedEntry.tags}
                          onChange={(e) => setEditedEntry({ ...editedEntry, tags: e.target.value })}
                          placeholder="work, health, family, etc."
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap mb-4">{entry.transcription}</div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Mood: </span>
                      <Badge
                        variant={
                          entry.mood === "positive" ? "success" : entry.mood === "negative" ? "destructive" : "outline"
                        }
                      >
                        {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <InsightsPanel insights={entry.insights} topics={entry.topics} />
          </div>
        </div>
      </div>
    </div>
  )
}

