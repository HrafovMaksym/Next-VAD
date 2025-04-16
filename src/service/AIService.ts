import { OpenAI } from "openai";

const client = new OpenAI({
  baseURL: process.env.AI_URL,
  apiKey: process.env.HUGGIN_FACE_TOKEN,
});

export async function SummarizeConversation() {
  const chatCompletion = await client.chat.completions.create({
    model: "accounts/fireworks/models/deepseek-v3",
    messages: [
      {
        role: "user",
        content: "What is the capital of France?",
      },
    ],
    max_tokens: 512,
  });

  console.log(chatCompletion.choices[0].message);

  //   return chatCompletion.choices[0].message.content;
}
