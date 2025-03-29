import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { transcription } = await request.json()

    if (!transcription) {
      return NextResponse.json({ error: "No transcription provided" }, { status: 400 })
    }

    // In a real application, you would use the OpenAI API to analyze the transcription
    // For this example, we'll use the AI SDK to generate insights

    const prompt = `
      Analyze the following journal entry and provide:
      1. Three key insights about the person's mental state, concerns, or positive aspects
      2. The main topics discussed (max 3) with approximate percentages
      3. The overall mood (positive, neutral, or negative)
      
      Journal entry: "${transcription}"
      
      Format your response as JSON with the following structure:
      {
        "insights": [
          {"title": "Insight 1", "description": "Description of insight 1"},
          {"title": "Insight 2", "description": "Description of insight 2"},
          {"title": "Insight 3", "description": "Description of insight 3"}
        ],
        "topics": [
          {"name": "Topic 1", "percentage": 40},
          {"name": "Topic 2", "percentage": 35},
          {"name": "Topic 3", "percentage": 25}
        ],
        "mood": "positive"
      }
    `

    // Use the AI SDK to generate insights
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
    })

    // Parse the response as JSON
    const insights = JSON.parse(text)

    return NextResponse.json(insights)
  } catch (error) {
    console.error("Error in insights API:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}

