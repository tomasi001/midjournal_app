"use client";

import { AudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/auth-context";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { Mic, SendHorizontal, XIcon } from "lucide-react";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioBase64?: string;
  audioContentType?: string;
}

const MindSearchPage = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        if (!recognitionRef.current) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = "en-US";

          recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            let transcript_to_append = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              transcript_to_append += event.results[i][0].transcript;
            }

            if (transcript_to_append) {
              setInput((prevText) => {
                const separator = prevText.trim().length > 0 ? " " : "";
                return prevText + separator + transcript_to_append.trim();
              });
            }
          };

          recognitionRef.current.onerror = (
            event: SpeechRecognitionErrorEvent
          ) => {
            console.error("Speech recognition error", event.error);
            toast.error(`Speech recognition error: ${event.error}`);
            setIsRecording(false);
          };

          recognitionRef.current.onend = () => {
            setIsRecording(false);
          };
        }
      } else {
        toast.error("Speech recognition not supported in this browser.");
      }
    }
    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
      const response = await fetch(`${baseUrl}/query/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: input }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
        },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          const updatedLastMessage = {
            ...lastMessage,
            content: lastMessage.content + chunk,
          };
          return [...prev.slice(0, -1), updatedLastMessage];
        });
      }
    } catch {
      toast.error("An error occurred while fetching the chat response.");
      // Clean up the empty assistant message on error
      setMessages((prev) =>
        prev.filter((m) => m.role !== "assistant" || m.content !== "")
      );
    } finally {
      setIsLoading(false);

      setMessages((currentMessages) => {
        return currentMessages;
      });
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
    <div className="flex flex-col h-screen bg-white text-black">
      <header className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-6 w-6 text-black" />
          <h1 className="text-lg font-semibold text-black">Mind search</h1>
        </div>
        <Link href="/">
          <XIcon className="h-6 w-6 text-gray-500" />
        </Link>
      </header>

      <main className="flex-grow overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-4 p-4">
            {messages.map((message) => (
              <Fragment key={message.id}>
                <div
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-md whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-gray-900 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
                {message.role === "assistant" && message.audioBase64 && (
                  <AudioPlayer
                    audioBase64={message.audioBase64}
                    audioContentType={message.audioContentType!}
                  />
                )}
              </Fragment>
            ))}
            {isLoading && messages[messages.length - 1].role === "user" && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg max-w-md whitespace-pre-wrap bg-gray-200 text-black">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </main>

      <footer className="pt-4 pb-2 bg-white">
        <div className="relative">
          <div className="overflow-hidden rounded-t-3xl shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.1)]">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
              className="w-full py-4 pl-4 pr-24 text-md bg-white focus:outline-none resize-none overflow-y-auto"
              style={{ maxHeight: "200px" }}
            />
          </div>
          <div className="absolute right-4 bottom-3.5 flex gap-x-2">
            <Button
              className="bg-white shadow-none h-7 w-7 bg-blue-100"
              onClick={handleMicClick}
              disabled={isLoading}
            >
              <Mic
                className={`size-5  text-gray-500 ${
                  isRecording ? "text-red-500" : ""
                }`}
              />
            </Button>
            <Button
              className="bg-white shadow-none h-7 w-7 bg-blue-100"
              onClick={handleSend}
              disabled={isRecording || isLoading}
            >
              <SendHorizontal className="size-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MindSearchPage;
