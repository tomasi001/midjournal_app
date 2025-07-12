"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
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
import {
  JournalEntriesList,
  JournalEntry,
} from "@/components/journal-entries-list";
import { Chat } from "@/components/chat";

function JournalPage() {
  const { token, logout } = useAuth();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isEntriesLoading, setIsEntriesLoading] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!token) {
      setIsEntriesLoading(false);
      return;
    }
    setIsEntriesLoading(true);
    try {
      const response = await fetch("/api/journal/entries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        toast.error("Failed to fetch journal entries.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching journal entries.");
      console.error(error);
    } finally {
      setIsEntriesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    // Check if any entries are still being analyzed. We'll use the summary field
    // as an indicator that the analysis is complete.
    const isAnalysisPending = entries.some((entry) => !entry.summary);

    // If analysis is pending, start polling
    if (isAnalysisPending && !pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(() => {
        fetchEntries();
      }, 10000); // Poll every 10 seconds
    } else if (!isAnalysisPending && pollingIntervalRef.current) {
      // If no analysis is pending, stop polling
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Cleanup on component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [entries, fetchEntries]);

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
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Replace the list of files with the new selection
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/markdown": [".md"],
    },
    multiple: true,
  });

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
        setText(""); // Clear textarea
        fetchEntries(); // Refresh the list
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

  const handleFileSubmit = async () => {
    if (files.length === 0) {
      toast.error("Please select one or more files to upload.");
      return;
    }
    setIsLoading(true);

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const success = await handleSubmit(file);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    if (errorCount === 0) {
      toast.success(`All ${successCount} files uploaded successfully!`);
    } else {
      toast.warning(`${successCount} files uploaded, ${errorCount} failed.`);
    }

    setFiles([]);
    setIsModalOpen(false);
    setIsLoading(false);
  };

  const handleSubmit = async (fileToUpload: File): Promise<boolean> => {
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
        toast.success(
          result.message || `'${fileToUpload.name}' submitted successfully.`
        );
        return true;
      } else {
        toast.error(
          `'${fileToUpload.name}' failed: ${result.detail || "Unknown error"}`
        );
        return false;
      }
    } catch (error) {
      toast.error(`An error occurred submitting '${fileToUpload.name}'.`);
      console.error(error);
      return false;
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
          <h2 className="text-2xl font-bold mb-4">Create a Journal Entry</h2>
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
                          Drag &apos;n&apos; drop a file here, or click to
                          select a file
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Supported: TXT, PDF, PNG, JPG, DOCX, MD
                      </p>
                    </div>
                    {files.length > 0 && (
                      <div className="mt-4 text-sm text-center">
                        <p className="font-semibold">Selected files:</p>
                        <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                          {files.map((file, index) => (
                            <li key={index} className="truncate">
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button
                      onClick={handleFileSubmit}
                      disabled={files.length === 0 || isLoading}
                      className="w-full mt-4"
                    >
                      {isLoading
                        ? "Uploading..."
                        : `Submit ${files.length} File(s)`}
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
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold mb-4">Past Entries</h2>
          <JournalEntriesList entries={entries} isLoading={isEntriesLoading} />
        </div>
        <div className="md:col-span-2">
          <Chat />
        </div>
      </main>
    </div>
  );
}

export default withAuth(JournalPage);
