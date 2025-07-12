"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import MediumSelectionButton from "@/components/v0/MediumSelectionButton";
import LargeActionButton from "@/components/v0/LargeActionButton";
import {
  ChevronLeftIcon,
  MicrophoneIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { Keyboard } from "lucide-react";

import KeyboardEntry from "@/components/journal-entry/KeyboardEntry";
import VoiceEntry from "@/components/journal-entry/VoiceEntry";
import CameraEntry from "@/components/journal-entry/CameraEntry";

const JournalEntryPage = () => {
  const [selectedMedium, setSelectedMedium] = useState<
    "keyboard" | "voice" | "camera" | null
  >(null);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const renderMainContent = () => {
    switch (selectedMedium) {
      case "keyboard":
        return <KeyboardEntry text={text} setText={setText} />;
      case "voice":
        return (
          <VoiceEntry
            text={text}
            setText={setText}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
        );
      case "camera":
        return (
          <CameraEntry
            capturedImage={capturedImage}
            setCapturedImage={setCapturedImage}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center flex-grow">
            <p className="text-gray-500 mt-16">Choose your medium to begin:</p>
            <div className="flex mt-4">
              <MediumSelectionButton
                icon={<Keyboard className="h-10 w-10 text-gray-600" />}
                onClick={() => setSelectedMedium("keyboard")}
              />
              <MediumSelectionButton
                icon={<MicrophoneIcon className="h-10 w-10 text-gray-600" />}
                onClick={() => setSelectedMedium("voice")}
              />
              <MediumSelectionButton
                icon={<CameraIcon className="h-10 w-10 text-gray-600" />}
                onClick={() => setSelectedMedium("camera")}
              />
            </div>
          </div>
        );
    }
  };

  const handleBack = () => {
    if (isRecording) {
      setIsRecording(false);
    }
    setSelectedMedium(null);
    setCapturedImage(null);
    setText("");
  };

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <Header
        leftContent={
          selectedMedium ? (
            <button onClick={handleBack} className="flex items-center">
              <ChevronLeftIcon className="h-8 w-8 text-black" />
              <span className="ml-2 text-2xl font-bold">Journal</span>
            </button>
          ) : (
            <Link href="/" className="flex items-center">
              <ChevronLeftIcon className="h-8 w-8 text-black" />
              <span className="ml-2 text-2xl font-bold">Journal</span>
            </Link>
          )
        }
        rightContent={<FeedbackButton />}
      />
      <main className="p-6 flex flex-col items-center flex-grow">
        {renderMainContent()}
      </main>
      <footer className="p-6">
        <LargeActionButton
          disabled={
            !selectedMedium ||
            (selectedMedium === "keyboard" && !text) ||
            (selectedMedium === "voice" && !text) ||
            (selectedMedium === "camera" && !capturedImage)
          }
        >
          SUBMIT
        </LargeActionButton>
      </footer>
    </div>
  );
};

export default JournalEntryPage;
