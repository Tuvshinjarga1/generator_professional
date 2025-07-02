import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Write a professional, informative blog post about "${topic}" in the context of cloud technology. 

Requirements:
- Write in Mongolian language
- 800-1200 words
- Include current trends and practical insights
- Structure with clear sections
- Professional tone suitable for IT professionals
- Include real-world examples and use cases
- Focus on practical benefits and implementation considerations

IMPORTANT: Return ONLY valid JSON without any markdown formatting, explanations, or code blocks. Do not wrap the response in \`\`\`json or any other formatting.

Return exactly this JSON structure:
{
  "title": "Engaging title in Mongolian",
  "content": "Full blog post content in Mongolian with proper paragraphs",
  "tags": ["relevant", "cloud", "technology", "tags", "in", "mongolian"]
}`,
    });

    console.log("Raw AI response:", text);

    // Extract JSON from markdown if present
    let cleanText = text.trim();

    // Remove markdown code blocks if they exist - more comprehensive approach
    if (cleanText.includes("```")) {
      const jsonMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanText = jsonMatch[1].trim();
      } else {
        // Fallback: remove any ``` patterns
        cleanText = cleanText.replace(/```[\s\S]*?```/g, "").trim();
      }
    }

    console.log("Cleaned text:", cleanText);

    // Validate that cleanText looks like JSON before parsing
    if (!cleanText.startsWith("{") || !cleanText.endsWith("}")) {
      throw new Error(
        `Response doesn't appear to be JSON. Got: ${cleanText.substring(
          0,
          100
        )}...`
      );
    }

    const blogData = JSON.parse(cleanText);
    return NextResponse.json(blogData);
  } catch (error) {
    console.error("Error generating blog post:", error);
    console.error("Error type:", typeof error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      {
        error: "Failed to generate blog post",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
