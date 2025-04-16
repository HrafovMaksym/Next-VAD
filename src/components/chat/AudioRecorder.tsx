"use client";
import React, { useState, useEffect } from "react";
import { LoaderCircle, Mic, Pause } from "lucide-react";

const AudioRecorder = ({
  handleVoiceToText,
  isLoading,
}: {
  handleVoiceToText: (audioBlob: Blob) => void;
  isLoading: boolean;
}) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (mediaRecorder && mediaRecorder.state === "inactive" && audioBlob) {
      handleVoiceToText(audioBlob);
    }
  }, [audioBlob]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        setAudioBlob(event.data);
      }
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      <button
        className="bg-black text-white px-3 py-2 rounded-full flex items-center"
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isLoading ? (
          <p className="flex items-center gap-2">
            <span className="transition-all ease-in-out duration-300 animate-spin">
              <LoaderCircle width={18} />
            </span>
          </p>
        ) : (
          <>
            {isRecording ? (
              <span className="flex items-center">
                <Pause width={20} />
              </span>
            ) : (
              <span className="flex items-center">
                <Mic width={20} />
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default AudioRecorder;
