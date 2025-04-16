"use client";
import React, { useState, useRef } from "react";
import { LoaderCircle, Mic, Pause } from "lucide-react";

const AnalyseConversation = ({
  handleVoiceToText,
  isLoading,
}: {
  handleVoiceToText: (audioBlob: Blob) => void;
  isLoading: boolean;
}) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const [isRecording, setIsRecording] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isStopRef = useRef(false);
  const detectSilence = (
    stream: MediaStream,
    onSilence: () => void,
    silenceDelay = 3000,
    threshold = 0.01
  ) => {
    const audioCtx = new AudioContext();
    audioContextRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);

    analyser.fftSize = 512;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyserRef.current = analyser;
    sourceRef.current = source;

    const checkSilence = () => {
      analyser.getByteFrequencyData(data);
      const volume =
        data.reduce((sum, val) => sum + val, 0) / data.length / 255;

      if (volume < threshold) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            onSilence();
            silenceTimerRef.current = null;
          }, silenceDelay);
        }
      } else {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }

      if (isRecording) {
        requestAnimationFrame(checkSilence);
      }
    };

    requestAnimationFrame(checkSilence);
  };

  const detectSpeaking = (
    stream: MediaStream,
    threshold = 0.01,
    timeout = 60000
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);

      analyser.fftSize = 512;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      source.connect(analyser);
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      let silenceCounter = 0;
      const silenceLimit = 15;

      const timeoutId = setTimeout(() => {
        resolve(false);
      }, timeout);

      const checkSpeaking = () => {
        analyser.getByteFrequencyData(dataArray);
        const volume =
          dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255;

        if (volume > threshold) {
          silenceCounter = 0;
          clearTimeout(timeoutId);
          resolve(true);
        } else {
          silenceCounter++;
          if (silenceCounter > silenceLimit) {
            clearTimeout(timeoutId);
            resolve(false);
          } else {
            requestAnimationFrame(checkSpeaking);
          }
        }
      };

      checkSpeaking();
    });
  };
  const startRecording = async () => {
    isStopRef.current = false;
    const chunks: Blob[] = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.start();
    setIsRecording(true);

    detectSilence(stream, () => {
      if (recorder.state !== "inactive") {
        recorder.stop();
        stopRecording();
      }
    });
    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      if (isStopRef.current) {
        return;
      }
      const res: any = await handleVoiceToText(audioBlob);
      if (res) {
        const detect = await detectSpeaking(stream);
        if (!isStopRef.current && detect) {
          startRecording();
        } else {
          stopRecording();
        }
      }
    };
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setIsRecording(false);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const stopAll = () => {
    isStopRef.current = true;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    setIsRecording(false);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.mediaStream
        .getTracks()
        .forEach((track) => track.stop());
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
  };

  return (
    <div>
      <button
        className="bg-black text-white px-3 py-2 rounded-full flex items-center"
        onClick={isRecording ? stopAll : startRecording}
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

export default AnalyseConversation;
