"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { Chat } from "@/components/chat";
import { toast } from "sonner";
import { UploadCloud, Mic, FileUp } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function JournalPage() {
  const { token, logout } = useAuth();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
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

        recognitionRef.current.onerror = (event: any) => {
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
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    multiple: false,
  });

  const handleTextSubmit = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to submit.");
      return;
    }
    const textAsBlob = new Blob([text], { type: "text/plain" });
    const textFile = new File([textAsBlob], "journal_entry.txt", {
      type: "text/plain",
    });
    await handleSubmit(textFile);
    setText("");
  };

  const handleFileSubmit = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }
    await handleSubmit(file);
    setFile(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (fileToUpload: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", fileToUpload);

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
        toast.success(result.message || "Content submitted successfully.");
      } else {
        toast.error(`Submission failed: ${result.detail || "Unknown error"}`);
      }
    } catch (error) {
      toast.error("An error occurred during submission.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Journal</h1>
        <Button onClick={logout} variant="outline">
          Sign out
        </Button>
      </header>
      <main className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Submit a Memory</h2>
          <div className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center">
              <div className="space-x-2">
                <Button onClick={handleTextSubmit} disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Text"}
                </Button>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileUp className="mr-2 h-4 w-4" /> Upload File
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload a Document</DialogTitle>
                    </DialogHeader>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                      ${
                        isDragActive
                          ? "border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                      {isDragActive ? (
                        <p>Drop the file here ...</p>
                      ) : (
                        <p>
                          Drag 'n' drop a file here, or click to select a file
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Supported: TXT, PDF, PNG, JPG
                      </p>
                    </div>
                    {file && (
                      <div className="mt-4 text-center">
                        <p>Selected file: {file.name}</p>
                      </div>
                    )}
                    <Button
                      onClick={handleFileSubmit}
                      disabled={!file || isLoading}
                      className="w-full mt-4"
                    >
                      {isLoading ? "Uploading..." : "Submit File"}
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
              <Button
                variant="outline"
                size="icon"
                disabled={isLoading}
                onClick={handleMicClick}
              >
                <Mic
                  className={`h-4 w-4 ${isRecording ? "text-red-500" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
        <div>
          <Chat />
        </div>
      </main>
    </div>
  );
}

export default withAuth(JournalPage);
