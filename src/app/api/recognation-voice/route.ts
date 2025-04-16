import { NextRequest } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVEN_VOICE_ID}`,
      {
        text: data,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          accept: "audio/mpeg",
          "xi-api-key": process.env.ELEVEN_API_KEY!,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    return new Response(response.data, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: any) {
    console.error("TTS error:", error?.response?.data || error.message);
    return new Response(JSON.stringify({ error: "Failed to generate voice" }), {
      status: 500,
    });
  }
}
