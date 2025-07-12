"use client";

import React, { useRef, useEffect, useState } from "react";
import { MicrophoneIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface VoiceEntryProps {
  text: string;
  setText: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}

const VoiceEntry: React.FC<VoiceEntryProps> = ({
  text,
  setText,
  isRecording,
  setIsRecording,
}) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event) => {
          let transcript_to_append = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript_to_append += event.results[i][0].transcript;
          }

          if (transcript_to_append) {
            setText((prevText) => {
              const separator = prevText.trim().length > 0 ? " " : "";
              return prevText + separator + transcript_to_append.trim();
            });
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          toast.error(`Speech recognition error: ${event.error}`);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      } else {
        toast.error("Speech recognition not supported in this browser.");
      }
    }

    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    };
  }, [setText, setIsRecording, isRecording]);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="w-full h-full flex-grow flex flex-col items-center justify-center">
      <p className="text-gray-500 mb-4">
        {isRecording ? "Recording..." : "Click the mic to start"}
      </p>
      <button
        onClick={handleMicClick}
        className={`rounded-full p-4 ${
          isRecording ? "bg-red-500 text-white animate-pulse" : "bg-gray-200"
        }`}
      >
        <MicrophoneIcon className="h-10 w-10" />
      </button>
      <div className="w-full text-left p-4 text-lg mt-4 flex-grow">{text}</div>
    </div>
  );
};

export default VoiceEntry;
