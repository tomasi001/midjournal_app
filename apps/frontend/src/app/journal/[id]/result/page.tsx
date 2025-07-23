"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import LargeActionButton from "@/components/v0/LargeActionButton";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import JournalEntryCard from "@/components/v0/JournalEntryCard";
import { Scan, Share } from "lucide-react";

interface JournalEntry {
  id: string;
  entry_number: number;
  title: string | null;
  created_at: string;
  image_url: string | null;
}

const JournalResultPage = () => {
  const params = useParams();
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
          console.error("Failed to fetch journal entry.");
          setEntry(null);
        }
      } catch (error) {
        console.error("An error occurred while fetching journal entry:", error);
        setEntry(null);
      } finally {
        setLoading(false);
      }
    };

    if (entryId) {
      fetchEntry();
    }
  }, [entryId, token]);

  useEffect(() => {
    if (!entry || entry.title) {
      return;
    }

    const pollForTitle = async () => {
      if (!token || !entryId) return;
      try {
        const response = await fetch(`/api/journal/entries/${entryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            setEntry(data);
          }
        }
      } catch (error) {
        console.error(
          "An error occurred while polling for entry title:",
          error
        );
      }
    };

    const interval = setInterval(pollForTitle, 2000);

    return () => clearInterval(interval);
  }, [entry, entryId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex justify-center items-center h-screen">
        Entry not found.
      </div>
    );
  }

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <Header
        leftContent={
          <Link href="/library" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-6 w-6 text-black" />
            {/* <h1 className="text-2xl font-bold">Entry {entryNumber}</h1> */}
          </Link>
        }
        rightContent={
          <div className="flex items-center gap-2">
            <FeedbackButton />
            <Link href={`/journal/${entryId}/result/full`}>
              <Scan className="h-5 w-5 text-black" />
            </Link>
            <Share className="h-5 w-5 text-black" />
          </div>
        }
      />
      <main className="px-6 flex justify-center flex-grow">
        <div className="relative w-full max-w-sm">
          {entry && (
            <JournalEntryCard
              size="large"
              entryId={entry.id}
              entryNumber={entry.entry_number}
              imageUrl={entry.image_url}
              title={entry.title ?? undefined}
              date={entry.created_at}
            />
          )}
        </div>
      </main>
      <footer className="p-6">
        <Link href={`/journal/${entryId}/insights`}>
          <LargeActionButton>VIEW INSIGHTS </LargeActionButton>
        </Link>
      </footer>
    </div>
  );
};

export default withAuth(JournalResultPage);
