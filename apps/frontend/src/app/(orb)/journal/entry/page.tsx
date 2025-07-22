"use client";

import CameraEntry from "@/components/journal-entry/CameraEntry";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import SubmitButton from "@/components/v0/SubmitButton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import InputToolbar from "@/components/journal-entry/InputToolbar";
import JournalEntryComposer from "@/components/journal-entry/JournalEntryComposer";
import { motion } from "framer-motion";
import OrganicSphere from "@/components/sphere/OrganicSphere";

const JournalEntryPage = () => {
  const { token } = useAuth();
  const router = useRouter();

  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.visualViewport) {
      const visualViewport = window.visualViewport;

      const handleResize = () => {
        if (footerRef.current) {
          // When the keyboard is open, visualViewport.height shrinks.
          // We calculate how much space the keyboard takes up.
          const keyboardHeight = window.innerHeight - visualViewport.height;

          // We move the footer up by the height of the keyboard.
          // We also need to account for the visualViewport.offsetTop if the browser window itself is scrolled.
          const offset = keyboardHeight - visualViewport.offsetTop - 10;

          if (offset > 0) {
            footerRef.current.style.bottom = `${offset}px`;
          } else {
            footerRef.current.style.bottom = "0px";
          }
        }
      };

      visualViewport.addEventListener("resize", handleResize);
      return () => visualViewport.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !recognitionRef.current) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognitionRef.current = recognition;

        recognition.onresult = (event) => {
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

        recognition.onend = () => {
          if (isRecording) {
            setIsRecording(false);
          }
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          toast.error(`Speech recognition error: ${event.error}`);
          if (isRecording) {
            setIsRecording(false);
          }
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
  }, [isRecording]);

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
          const chunk = decoder.decode(value, { stream: false });
          fullText += chunk;
        }
      }

      if (fullText.trim()) {
        setText(
          (prev) => (prev.trim() ? `${prev.trim()} ` : "") + fullText.trim()
        );
        setCapturedImage(null);
        setIsCameraOpen(false);
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

  // TODO: IMPLEMENT ACTUAL DOCUMENT PARSING FOR TEXT FILES
  const handleDocumentOcrRequest = async (file: File) => {
    console.log("submitting file", file.name);
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

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const handleCameraClick = () => {
    setIsCameraOpen(true);
  };

  const handleDocumentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleDocumentOcrRequest(file);
    }
  };

  const hasContent = text.trim().length > 0;

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <div>
        <Header
          leftContent={
            <button onClick={() => router.back()} className="flex items-center">
              <ChevronLeftIcon className="h-8 w-8 text-black" />
              <span className="ml-2 text-2xl font-bold">Journal</span>
            </button>
          }
          rightContent={<FeedbackButton />}
        />
      </div>
      <main className="p-6 flex flex-col items-center flex-grow pb-32">
        <motion.div
          layoutId="orb"
          className="w-64 h-64 relative"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          animate={{ scale: 0.5625 }}
        >
          <OrganicSphere />
        </motion.div>
        <div className="w-full">
          <JournalEntryComposer text={text} setText={setText} />
        </div>
      </main>
      <div>
        <footer
          ref={footerRef}
          className="fixed bottom-0 left-0 right-0 p-6 flex justify-between items-center"
          style={{ transform: "translateZ(0)" }}
        >
          <InputToolbar
            onCameraClick={handleCameraClick}
            onVoiceClick={handleMicClick}
            onDocumentClick={handleDocumentClick}
            isRecording={isRecording}
          />
          {hasContent && (
            <div>
              <SubmitButton onClick={handleTextSubmit} disabled={isLoading}>
                {isLoading ? "SUBMITTING..." : "SUBMIT"}
              </SubmitButton>
            </div>
          )}
        </footer>
      </div>
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-full h-full flex items-center justify-center">
          <CameraEntry
            capturedImage={capturedImage}
            setCapturedImage={setCapturedImage}
            onExtractText={handleOcrRequest}
          />
        </DialogContent>
      </Dialog>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,application/pdf"
      />
    </div>
  );
};

export default withAuth(JournalEntryPage);
