"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import LargeActionButton from "@/components/v0/LargeActionButton";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import Iridescence from "@/components/ui/Iridescence";

interface JournalEntry {
  id: string;
  entry_number: number;
  summary: string | null;
  emotions: string[] | null;
  themes: string[] | null;
  image_url: string;
}

const JournalInsightsPage = ({ params }: { params: { id: string } }) => {
  const { token } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const entryId = params.id;

  useEffect(() => {
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

    fetchEntry();
  }, [entryId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading insights...
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex justify-center items-center h-screen">
        Insights not found or still processing.
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
            <h1 className="text-2xl font-bold">Insights</h1>
          </Link>
        }
        rightContent={<FeedbackButton />}
      />
      <main className="p-6 flex flex-col items-center flex-grow">
        <div className="mt-8 w-40 h-40 rounded-full bg-gray-100 shadow-lg flex-shrink-0 overflow-hidden">
          {entry.image_url ? (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('${entry.image_url}')`,
              }}
            ></div>
          ) : (
            <Iridescence />
          )}
        </div>

        <div className="mt-8 px-4 w-full">
          <h2 className="text-2xl font-bold mb-4">Summary</h2>
          <p className="text-lg mb-4">
            {entry.summary || "No summary available."}
          </p>

          <h2 className="text-2xl font-bold mb-4">Emotions</h2>
          <ul className="list-disc list-inside space-y-2 text-lg mb-4">
            {entry.emotions?.length ? (
              entry.emotions.map((emotion, index) => (
                <li key={index}>{emotion}</li>
              ))
            ) : (
              <li>No emotions detected.</li>
            )}
          </ul>

          <h2 className="text-2xl font-bold mb-4">Themes</h2>
          <ul className="list-disc list-inside space-y-2 text-lg">
            {entry.themes?.length ? (
              entry.themes.map((theme, index) => <li key={index}>{theme}</li>)
            ) : (
              <li>No themes detected.</li>
            )}
          </ul>
        </div>
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
