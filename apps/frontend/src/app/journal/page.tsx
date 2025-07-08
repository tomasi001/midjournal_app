"use client";

import { useState } from "react";
import { withAuth } from "@/components/with-auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chat } from "@/components/chat";

function JournalPage() {
  const { logout, token } = useAuth();
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleIngest = async () => {
    if (!text.trim()) {
      toast.warning("Please enter some text to ingest.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/ingest/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        toast.success("Text successfully queued for ingestion.");
        setText(""); // Clear textarea on success
      } else {
        const errorData = await response.json();
        toast.error(`Ingestion failed: ${errorData.detail || "Unknown error"}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred during ingestion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Journal</h1>
        <Button onClick={logout} variant="outline">
          Sign out
        </Button>
      </header>

      <main className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Journal Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full gap-2">
              <Textarea
                placeholder="What's on your mind?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
              />
              <Button onClick={handleIngest} disabled={isLoading}>
                {isLoading ? "Ingesting..." : "Submit Entry"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Chat />
      </main>
    </div>
  );
}

export default withAuth(JournalPage);
