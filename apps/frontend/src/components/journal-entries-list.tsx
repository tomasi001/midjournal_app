"use client";

import { useState } from "react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedList from "./AnimatedList";
import "./AnimatedList.css";
import JournalCard from "./JournalCard";
import "./JournalCard.css";

// Define the type for a journal entry based on the backend schema
export interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  sentiment: string | null;
  keywords: string[] | null;
  summary: string | null;
}

interface JournalEntriesListProps {
  entries: JournalEntry[];
  isLoading: boolean;
}

export function JournalEntriesList({
  entries,
  isLoading,
}: JournalEntriesListProps) {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const handleCardClick = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) {
    return <p>Loading entries...</p>;
  }

  if (entries.length === 0) {
    return <p>No journal entries yet. Submit one to get started!</p>;
  }

  const items = entries.map((entry) => (
    <div
      key={entry.id}
      className={`group perspective-1000 ${
        flippedCards[entry.id] ? "flip" : ""
      }`}
    >
      <div
        className="flip-card-inner relative w-full h-full transform-style-preserve-3d transition-transform duration-700"
        style={{
          aspectRatio: "0.718",
          maxHeight: "540px",
          height: "80svh",
        }}
      >
        <div className="flip-card-front absolute w-full h-full backface-hidden">
          <JournalCard enableTilt={!flippedCards[entry.id]}>
            <div className="jc-content">
              <div className="h-full flex flex-col p-6 text-white text-left">
                <CardHeader className="flex-shrink-0 !p-0">
                  <CardTitle className="text-white">
                    {entry.title || "Journal Entry"}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {new Date(entry.created_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>

                <div className="flex-grow mt-4 overflow-y-auto pr-2">
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                </div>

                <div className="flex-shrink-0 text-sm text-gray-400 text-center py-2">
                  Click to see insights
                </div>
              </div>
            </div>
          </JournalCard>
        </div>
        <div className="flip-card-back absolute w-full h-full backface-hidden">
          <JournalCard enableTilt={flippedCards[entry.id]}>
            <div className="jc-content">
              <div className="h-full flex flex-col p-6 text-white text-left">
                <CardHeader className="flex-shrink-0 !p-0">
                  <CardTitle className="text-white">Analysis</CardTitle>
                  <CardDescription className="text-gray-300">
                    {new Date(entry.updated_at).toLocaleString()}
                  </CardDescription>
                </CardHeader>

                <div className="flex-grow mt-4 overflow-y-auto pr-2">
                  {entry.summary && (
                    <p className="font-semibold italic mb-4">
                      &quot;{entry.summary}&quot;
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 items-center">
                    {entry.sentiment && (
                      <Badge
                        variant={
                          entry.sentiment === "Positive"
                            ? "default"
                            : entry.sentiment === "Negative"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {entry.sentiment}
                      </Badge>
                    )}
                    {entry.keywords?.map((keyword) => (
                      <Badge key={keyword} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0 text-sm text-gray-400 text-center py-2">
                  Click to see journal
                </div>
              </div>
            </div>
          </JournalCard>
        </div>
      </div>
    </div>
  ));

  return (
    <AnimatedList
      items={items}
      onItemSelect={(index) => handleCardClick(entries[index].id)}
    />
  );
}
