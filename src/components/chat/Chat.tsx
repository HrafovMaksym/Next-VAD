"use client";
import React, { useState } from "react";
import { Bot, Speech } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import { SpeechToText } from "../utils/SpeechToText";
import AnalyseConversation from "./AnalyseConversation";

const Chat = () => {
  const [messages, setMessages] = React.useState<
    { sender: string; value: string }[]
  >([]);

  const [isVoiceLoading, setVoiceIsLoading] = useState(false);

  const handleSendMessage = async (audio: Blob) => {
    console.log("start");

    try {
      setVoiceIsLoading(true);
      const text = await SpeechToText(audio);

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "User", value: text },
      ]);
      if (text) {
        // const data = await SummarizeConversation(text);
        const answer = "This is a test answer";
        // await playVoice(answer);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "Bot", value: answer },
        ]);
        return true;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setVoiceIsLoading(false);
    }
  };

  const playVoice = async (data: string) => {
    try {
      const response = await axios.post(
        "/api/recognation-voice",
        { data },
        {
          responseType: "blob",
        }
      );

      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      return new Promise((resolve) => {
        audio.onended = () => {
          resolve(true);
        };

        audio.play();
      });
    } catch (error) {
      console.error("Error playing Kats voice:", error);
    }
  };

  return (
    <div className=" text-[#1e1e1e] min-h-screen flex justify-center items-center p-4 w-[70%]">
      <div className="w-full max-w-3xl h-[75vh] rounded-xl border border-gray-300 bg-white p-4 flex flex-col justify-between shadow-xl">
        <div className="overflow-y-auto space-y-4 pr-2">
          {messages.map((message, id) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.sender === "User" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-xl px-4 py-2 max-w-[75%] text-sm whitespace-pre-line ${
                  message.sender === "User"
                    ? "bg-blue-500 text-white"
                    : "bg-[#f1f5f9] text-[#1e1e1e]"
                }`}
              >
                {message.sender === "Bot" && (
                  <div className="flex items-center gap-2 mb-1 text-xs text-blue-500">
                    <Bot size={16} />
                    {message.sender}
                  </div>
                )}
                {message.value}
              </div>
            </motion.div>
          ))}
        </div>
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-gray-400 text-sm">
            <div>
              <Speech className="mx-auto mb-2" size={32} />
              <p>
                Tap the microphone and start speaking to chat with the AI voice.
              </p>
            </div>
          </div>
        )}
        <div className="mt-4 mr-4 flex justify-end">
          <AnalyseConversation
            handleVoiceToText={handleSendMessage}
            isLoading={isVoiceLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
