import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini with the API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, image } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // For Gemini, history must strictly alternate between 'user' and 'model', starting with 'user'.
    const rawHistory = (history || [])
      .filter((m: any) => m.id !== 'init')
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    // Ensure strict alternation and start with 'user'
    const formattedHistory: any[] = [];
    let expectedRole = "user";
    for (const msg of rawHistory) {
      if (msg.role === expectedRole) {
        formattedHistory.push(msg);
        expectedRole = expectedRole === "user" ? "model" : "user";
      } else if (msg.role === "user" && expectedRole === "model") {
        // If we get consecutive users, merge them or just take the latest. We'll take the latest by replacing the last user.
        // Or to be safe, just skip it until we get a model, or append text. Let's merge parts.
        const lastMsg = formattedHistory[formattedHistory.length - 1];
        if (lastMsg && lastMsg.role === "user") {
          lastMsg.parts[0].text += "\n" + msg.parts[0].text;
        }
      }
    }

    // Ensure the last role in history is 'model' so the new message from 'user' is valid
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === "user") {
      formattedHistory.pop();
    }

    // Start chat session
    const chat = model.startChat({
      history: formattedHistory,
    });

    const msgParts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];

    // Add Text Message
    if (message) {
      msgParts.push({ text: message });
    }

    // Add Image if present
    if (image) {
      // image format expected: "data:image/jpeg;base64,...base64string..."
      const mimeTypeMatch = image.match(/data:(.*?);base64,/);
      if (mimeTypeMatch && mimeTypeMatch.length > 1) {
        const mimeType = mimeTypeMatch[1];
        const base64Data = image.split(",")[1];
        
        msgParts.push({
          inlineData: {
            data: base64Data,
            mimeType,
          },
        });
      }
      
      // If no text was provided but an image is, prompt it to analyze it
      if (!message) {
        msgParts.push({ text: "Tolong jelaskan apa yang ada di gambar ini." });
      }
    }

    const result = await chat.sendMessage(msgParts as any);
    const responseText = result.response.text();

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error("DETAIL ERROR GEMINI:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
