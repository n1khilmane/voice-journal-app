"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MicIcon, StopCircleIcon, Loader2Icon, SaveIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcription, setTranscription] = useState("")
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(audioUrl)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  const transcribeAudio = async () => {
    if (!audioBlob) return

    setIsTranscribing(true)

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Transcription failed")
      }

      const data = await response.json()
      setTranscription(data.transcription)
    } catch (error) {
      console.error("Error transcribing audio:", error)
      toast({
        title: "Transcription Error",
        description: "Failed to transcribe your recording. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  const saveJournalEntry = async () => {
    if (!audioBlob || !transcription) return

    setIsSaving(true)

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob)
      formData.append("transcription", transcription)

      const response = await fetch("/api/journal", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to save journal entry")
      }

      const { id } = await response.json()

      toast({
        title: "Journal Entry Saved",
        description: "Your voice journal entry has been saved successfully.",
      })

      // Navigate to the journal entry page
      router.push(`/journal/${id}`)
    } catch (error) {
      console.error("Error saving journal entry:", error)
      toast({
        title: "Save Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Record Your Journal Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-primary/20">
            {isRecording ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 mb-4 relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-16 h-16 rounded-full border-primary relative z-10"
                    onClick={stopRecording}
                  >
                    <StopCircleIcon className="h-8 w-8 text-destructive" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">Recording...</p>
              </div>
            ) : (
              <Button variant="outline" size="lg" className="gap-2" onClick={startRecording} disabled={isTranscribing}>
                <MicIcon className="h-5 w-5" />
                Start Recording
              </Button>
            )}

            {audioUrl && !isRecording && (
              <div className="mt-6 w-full">
                <p className="text-sm text-muted-foreground mb-2">Preview your recording:</p>
                <audio src={audioUrl} controls className="w-full" />

                <Button variant="secondary" className="mt-4 w-full" onClick={transcribeAudio} disabled={isTranscribing}>
                  {isTranscribing ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    "Transcribe Recording"
                  )}
                </Button>
              </div>
            )}
          </div>

          {transcription && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Transcription</h3>
              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                className="min-h-[200px]"
                placeholder="Your transcription will appear here..."
              />
            </div>
          )}
        </CardContent>

        {transcription && (
          <CardFooter>
            <Button className="w-full gap-2" onClick={saveJournalEntry} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="h-4 w-4" />
                  Save Journal Entry
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

