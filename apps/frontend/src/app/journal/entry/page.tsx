"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";

import { useAuth } from "@/context/auth-context";
import KeyboardEntry from "@/components/journal-entry/KeyboardEntry";
import VoiceEntry from "@/components/journal-entry/VoiceEntry";
import CameraEntry from "@/components/journal-entry/CameraEntry";
import { withAuth } from "@/components/with-auth";

const JournalEntryPage = () => {
  const { token } = useAuth();
  const router = useRouter();

  const [selectedMedium, setSelectedMedium] = useState<
    "keyboard" | "voice" | "camera" | null
  >(null);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleOcrRequest = async () => {
    if (!capturedImage) {
      toast.error("No image has been captured.");
      return;
    }
    setIsLoading(true);
    setText(""); // Clear previous text
    const imageFile = dataURLtoFile(capturedImage, `capture-${Date.now()}.png`);
    if (!imageFile) {
      toast.error("There was an error processing the image.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const response = await fetch("/api/journal/ocr", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok || !response.body) {
        const result = await response.json();
        throw new Error(result.detail || "OCR request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      let fullText = "";
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setText((prev) => prev + chunk);
          fullText += chunk;
        }
      }

      if (fullText.trim()) {
        setSelectedMedium("keyboard");
        setCapturedImage(null);
      } else {
        toast.error("Could not extract any text from the image.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`An error occurred during OCR: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to submit.");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("/api/journal/entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: text }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Journal entry created successfully.");
        router.push(`/journal/${result.id}/result`);
      } else {
        toast.error(
          `Failed to create entry: ${result.detail || "Unknown error"}`
        );
      }
    } catch (error) {
      toast.error("An error occurred while creating the journal entry.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSubmit = async () => {
    if (!capturedImage) {
      toast.error("No image has been captured.");
      return;
    }
    setIsLoading(true);
    const imageFile = dataURLtoFile(capturedImage, `capture-${Date.now()}.png`);
    if (!imageFile) {
      toast.error("There was an error processing the image.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const response = await fetch("/api/ingest/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          result.message || `'${imageFile.name}' submitted successfully.`
        );
        router.push("/");
      } else {
        toast.error(
          `'${imageFile.name}' failed: ${result.detail || "Unknown error"}`
        );
      }
    } catch (error) {
      toast.error(`An error occurred submitting '${imageFile.name}'.`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedMedium === "keyboard" || selectedMedium === "voice") {
      await handleTextSubmit();
    } else if (selectedMedium === "camera") {
      await handleImageSubmit();
    }
  };

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
            onExtractText={handleOcrRequest}
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
          onClick={handleSubmit}
          disabled={
            isLoading ||
            !selectedMedium ||
            (selectedMedium === "keyboard" && !text) ||
            (selectedMedium === "voice" && !text) ||
            (selectedMedium === "camera" && !capturedImage)
          }
        >
          {isLoading ? "SUBMITTING..." : "SUBMIT"}
        </LargeActionButton>
      </footer>
    </div>
  );
};

export default withAuth(JournalEntryPage);
