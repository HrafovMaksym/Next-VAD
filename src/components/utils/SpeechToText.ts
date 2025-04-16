"use server";

export async function SpeechToText(audioBlob: Blob) {
  try {
    console.log(audioBlob);

    const arrayBuffer = await audioBlob.arrayBuffer();

    const response = await fetch(
      "https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGIN_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: arrayBuffer,
      }
    );

    const result = await response.json();
    console.log(result);

    return result.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio");
  }
}
