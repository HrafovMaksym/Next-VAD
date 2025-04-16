// import { OpenAI } from "openai";

// const client = new OpenAI({
//   baseURL: "https://router.huggingface.co/together/v1",
//   apiKey: process.env.HUGGIN_FACE_TOKEN,
// });
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(`${process.env.HUGGIN_FACE_TOKEN}`);

export async function SummarizeConversation(userText: string) {
  const prompt = `You are a friendly and helpful voice assistant. You support natural, human-like conversation. 
Answer the user's questions clearly and concisely, and feel free to ask follow-up questions to keep the conversation going. Speak in a calm and polite tone.
And always respond on the user's language.
User Text: ${userText}`;

  const chatCompletion = await client.chatCompletion({
    provider: "together",
    model: "deepseek-ai/DeepSeek-V3",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 512,
  });

  console.log(chatCompletion.choices[0].message);

  //   return chatCompletion.choices[0].message.content;
}
