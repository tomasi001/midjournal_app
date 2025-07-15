"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import LargeActionButton from "@/components/v0/LargeActionButton";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- START: Duplicated Type Definitions ---
// In a real application, these would be in a shared `types` directory.
interface CoreEmotionalLandscape {
  dominant_emotions: { emotion: string; intensity: number }[];
  emotional_valence: string;
  emotional_shifts: string[];
}

interface KeyThemesTopics {
  top_keywords: string[];
  identified_themes: string[];
}

interface CognitivePatterns {
  recurring_thoughts: string[];
  self_perception: string;
  beliefs_values: string[];
  problems_challenges: string[];
}

interface RelationalDynamics {
  mentioned_individuals: {
    name: string;
    relationship: string;
    sentiment: string;
  }[];
  relationship_tone: string[];
}

interface PotentialTriggersContextualClues {
  events_situations: string[];
  time_bound_indicators: string[];
}

interface JournalEntry {
  id: string;
  entry_number: number;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  sentiment: string | null;
  keywords: string[] | null;
  summary: string | null;
  emotional_landscape: CoreEmotionalLandscape | null;
  themes_topics: KeyThemesTopics | null;
  cognitive_patterns: CognitivePatterns | null;
  relational_dynamics: RelationalDynamics | null;
  contextual_clues: PotentialTriggersContextualClues | null;
}
// --- END: Duplicated Type Definitions ---

const JournalInsightsPage = () => {
  const params = useParams();
  const { token } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const entryId = params.id;

  useEffect(() => {
    setIsClient(true);
    const fetchEntry = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/journal/entries/${entryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEntry(data);
        } else {
          console.error("Failed to fetch journal entry insights.");
          setEntry(null);
        }
      } catch (error) {
        console.error("An error occurred while fetching insights:", error);
        setEntry(null);
      } finally {
        setLoading(false);
      }
    };

    if (entryId) {
      fetchEntry();
    }
  }, [entryId, token]);

  if (!isClient || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white text-black">
        Loading insights...
      </div>
    );
  }

  if (!entry || !entry.emotional_landscape) {
    return (
      <div className="flex justify-center items-center h-screen bg-white text-black">
        Insights not found or still processing. Please check back in a moment.
      </div>
    );
  }

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <Header
        leftContent={
          <Link
            href={`/journal/${entryId}/result`}
            className="flex items-center gap-2"
          >
            <ChevronLeftIcon className="h-8 w-8 text-black" />
            <h1 className="text-2xl font-bold">
              Insights {entry.entry_number}
            </h1>
          </Link>
        }
        rightContent={<FeedbackButton />}
      />
      <main className="p-6 flex-grow">
        <ScrollArea className="h-full">
          <div className="space-y-6">
            {entry.summary && (
              <Card className="bg-gray-100">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-2xl font-bold">
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg italic text-gray-600">
                    &quot;{entry.summary}&quot;
                  </p>
                </CardContent>
              </Card>
            )}

            {entry.emotional_landscape && (
              <Card className="bg-gray-100">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-2xl font-bold">
                    Emotional Landscape
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-gray-800 text-lg font-semibold">
                      Dominant Emotions:
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.emotional_landscape.dominant_emotions.map(
                        (e, i) => (
                          <Badge key={i}>
                            {e.emotion} ({Number(e.intensity).toFixed(1)})
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  <p className="text-gray-800 text-lg">
                    <span className="text-gray-800 text-lg font-semibold">
                      Valence:
                    </span>{" "}
                    {entry.emotional_landscape.emotional_valence}
                  </p>
                  <div>
                    <h4 className="text-gray-800 text-lg font-semibold">
                      Shifts:
                    </h4>
                    <ul className="list-disc list-inside text-gray-800">
                      {entry.emotional_landscape.emotional_shifts.map(
                        (s, i) => (
                          <li key={i}>{s}</li>
                        )
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {entry.themes_topics && (
              <Card className="bg-gray-100">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-2xl font-bold">
                    Themes & Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {entry.themes_topics.identified_themes.map((t, i) => (
                      <Badge key={i}>{t}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {entry.cognitive_patterns && (
              <Card className="bg-gray-100">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-2xl font-bold">
                    Cognitive Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-gray-800">
                    <span className="text-gray-800 text-lg font-semibold">
                      Self-Perception:
                    </span>{" "}
                    {entry.cognitive_patterns.self_perception}
                  </p>
                  <div>
                    <h4 className="text-gray-800 text-lg font-semibold">
                      Recurring Thoughts:
                    </h4>
                    <ul className="list-disc list-inside text-gray-800 ">
                      {entry.cognitive_patterns.recurring_thoughts.map(
                        (t, i) => (
                          <li key={i}>{t}</li>
                        )
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {entry.relational_dynamics &&
              entry.relational_dynamics.mentioned_individuals.length > 0 && (
                <Card className="bg-gray-100">
                  <CardHeader>
                    <CardTitle className="text-gray-800 text-2xl font-bold">
                      Relational Dynamics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-gray-800">
                      {entry.relational_dynamics.mentioned_individuals.map(
                        (p, i) => (
                          <li key={i}>
                            {p.name} ({p.relationship}) - {p.sentiment}
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}

            {entry.contextual_clues && (
              <Card className="bg-gray-100">
                <CardHeader>
                  <CardTitle className="text-gray-800 text-2xl font-bold">
                    Contextual Clues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-gray-800">
                    {entry.contextual_clues.events_situations.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </main>
      <footer className="p-6">
        <Link href="/">
          <LargeActionButton>FINISH</LargeActionButton>
        </Link>
      </footer>
    </div>
  );
};

export default withAuth(JournalInsightsPage);
