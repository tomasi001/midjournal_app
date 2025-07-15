"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import JournalEntryCard from "@/components/v0/JournalEntryCard";
import {
  ChevronLeftIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import AnimatedList from "@/components/AnimatedList";
import { useJournalEntries } from "@/context/journal-entries-context";

const JournalLibraryPage = () => {
  const { entries, loading, hasMore, loadMoreEntries, refreshEntries } =
    useJournalEntries();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      refreshEntries();
    }
  }, [token, refreshEntries]);

  return (
    <div className="bg-white text-black min-h-screen">
      <Header
        leftContent={
          <Link href="/" className="flex items-center gap-2">
            <ChevronLeftIcon className="h-8 w-8 text-black" />
            <span className="text-2xl font-bold">Library</span>
          </Link>
        }
        rightContent={
          <div className="flex items-center gap-4">
            <Link href="/journal/entry">
              <PlusIcon className="h-8 w-8 text-black" />
            </Link>
            <FeedbackButton />
          </div>
        }
      />
      <main className="p-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search or ask something...."
            className="w-full bg-gray-100 rounded-full py-3 pl-5 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <SparklesIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 text-gray-400" />
        </div>

        <div className="mt-8">
          {entries.length > 0 ? (
            <AnimatedList
              listClassName="grid grid-cols-2 gap-4"
              items={entries.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entryId={entry.id}
                  imageUrl={entry.image_url}
                  entryNumber={entry.entry_number}
                />
              ))}
              onLoadMore={loadMoreEntries}
              isLoading={loading}
              hasMore={hasMore}
            />
          ) : loading ? (
            <p>Loading entries...</p>
          ) : (
            <p>No entries found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default withAuth(JournalLibraryPage);
