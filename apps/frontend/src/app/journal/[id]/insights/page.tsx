"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Iridescence from "@/components/ui/Iridescence";
import FeedbackButton from "@/components/v0/FeedbackButton";
import Header from "@/components/v0/Header";
import LargeActionButton from "@/components/v0/LargeActionButton";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Image from "next/image"; // Importing Image from next/image
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
      if (!entry) {
        setLoading(true);
      }
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
        }
      } catch (error) {
        console.error("An error occurred while fetching insights:", error);
      } finally {
        setLoading(false);
      }
    };

    if (entryId) {
      fetchEntry();
    }
  }, [entry, entryId, token]);

  useEffect(() => {
    if (!entry || entry.emotional_landscape) {
      return;
    }

    const fetchEntry = async () => {
      if (!token || !entryId) return;
      try {
        const response = await fetch(`/api/journal/entries/${entryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEntry(data);
        }
      } catch (error) {
        console.error("An error occurred while polling for insights:", error);
      }
    };

    const interval = setInterval(fetchEntry, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [entry, entryId, token]);

  if (!isClient) {
    return null;
  }

  const insightsReady = !loading && entry && entry.emotional_landscape;

  return (
    <div className="relative bg-black text-white min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        {entry?.image_url ? (
          <Image
            src={entry.image_url}
            alt="Journal Entry Background"
            layout="fill" // Use layout fill to cover the parent
            className="object-cover"
            priority // Optional: prioritize loading this image
          />
        ) : (
          <Iridescence />
        )}
      </div>
      <div className="relative z-10 flex flex-col flex-grow">
        <Header
          leftContent={
            <Link
              href={`/journal/${entryId}/result`}
              className="flex items-center gap-2"
            >
              <ChevronLeftIcon className="h-8 w-8" />
              <h1 className="text-2xl font-bold">
                {entry ? `Insight ${entry.entry_number}` : "Loading Insight..."}
              </h1>
            </Link>
          }
          rightContent={<FeedbackButton />}
          className="bg-white/10 backdrop-blur-md text-white"
        />
        <main className="p-6 flex-grow">
          {insightsReady ? (
            <div className="space-y-6">
              {entry.summary && (
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl font-bold">
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg italic text-white">
                      &quot;{entry.summary}&quot;
                    </p>
                  </CardContent>
                </Card>
              )}

              {entry.emotional_landscape && (
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl font-bold">
                      Emotional Landscape
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-white text-lg font-semibold">
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
                    <p className="text-white text-lg">
                      <span className="text-white text-lg font-semibold">
                        Valence:
                      </span>{" "}
                      {entry.emotional_landscape.emotional_valence}
                    </p>
                    <div>
                      <h4 className="text-white text-lg font-semibold">
                        Shifts:
                      </h4>
                      <ul className="list-disc list-inside text-white">
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
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl font-bold">
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
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl font-bold">
                      Cognitive Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-white">
                      <span className="text-white text-lg font-semibold">
                        Self-Perception:
                      </span>{" "}
                      {entry.cognitive_patterns.self_perception}
                    </p>
                    <div>
                      <h4 className="text-white text-lg font-semibold">
                        Recurring Thoughts:
                      </h4>
                      <ul className="list-disc list-inside text-white">
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
                  <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl font-bold">
                        Relational Dynamics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-white">
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
                <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl font-bold">
                      Contextual Clues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-white">
                      {entry.contextual_clues.events_situations.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <Card className="bg-white/10 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-bold">
                    {loading ? "Loading Insights..." : "Generating Insights..."}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-white">
                    {loading
                      ? "Please wait a moment."
                      : "This can take a minute. Please check back soon."}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
        <footer className="p-6">
          <Link href="/">
            <LargeActionButton>FINISH</LargeActionButton>
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default withAuth(JournalInsightsPage);
