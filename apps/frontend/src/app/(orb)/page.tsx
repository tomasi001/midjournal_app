"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/v0/Header";
import { SparklesIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { withAuth } from "@/components/with-auth";
import { useJournalEntries } from "@/context/journal-entries-context";
import OrganicSphere from "@/components/sphere/OrganicSphere";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import AnimatedList from "@/components/AnimatedList";
import JournalEntryCard from "@/components/v0/JournalEntryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PwaManager } from "@/components/pwa/PwaManager";

const HomePage = () => {
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
      <PwaManager mode="dialog" />
      <div>
        <Header
          leftContent={
            <h1 className="text-2xl font-bold text-black">Midjournal</h1>
          }
          rightContent={
            <Link href="/profile">
              <UserCircleIcon className="h-10 w-10 text-black" />
            </Link>
          }
        />
      </div>
      <main className="pb-6 px-4 flex flex-col items-center">
        <div className="w-full relative z-10">
          <Link href="/mind-search">
            <div className="relative">
              <input
                type="text"
                placeholder="Search or ask something..."
                className="w-full border-1 border-gray-300 rounded-full py-2 pl-5 pr-12 text-md focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                readOnly
              />
              <SparklesIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 text-black" />
            </div>
          </Link>
        </div>
        <div className="flex flex-col items-center text-center">
          <motion.div
            layoutId="orb"
            className="w-64 h-64 relative"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            animate={{ scale: 1 }}
          >
            <Link href="/journal/entry" className="mt-12">
              <OrganicSphere />
            </Link>
          </motion.div>
          <div className="text-gray-500">
            <p>Verbalise your thoughts. Visualise your mind.</p>
            <p>Tap the orb to begin.</p>
          </div>
        </div>

        <div className="w-full mt-4">
          <Link href="/journal/entry" className="mt-12">
            <div className="w-full border-1 border-gray-300 text-gray rounded-2xl p-4 text-md focus:outline-none focus:ring-2 focus:ring-gray-300 h-32">
              <p className="text-gray-500">
                Or write what&apos;s on your mind here...
              </p>
            </div>
          </Link>
        </div>

        <div className="w-full mt-8">
          <Tabs defaultValue="journals" className="w-full flex flex-col">
            <TabsList className="bg-white rounded-lg">
              {/* <TabsTrigger
                value="most-recent"
                className="data-[state=active]:bg-gray-200 data-[state=active]:shadow-sm text-gray-400 data-[state=active]:text-gray-700 rounded-md"
              >
                Most recent
              </TabsTrigger> */}
              <TabsTrigger
                value="journals"
                className="data-[state=active]:bg-gray-200 data-[state=active]:shadow-sm text-gray-400 data-[state=active]:text-gray-700 rounded-md"
              >
                Journals
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-gray-200 data-[state=active]:shadow-sm text-gray-400 data-[state=active]:text-gray-700 rounded-md"
              >
                Notes
              </TabsTrigger>
            </TabsList>
            {/* <TabsContent value="most-recent" className="w-full pt-6">
              <div className="text-center py-10">
                <p className="text-gray-500">No recent items to show.</p>
              </div>
            </TabsContent> */}
            <TabsContent value="journals" className="w-full">
              {entries.length > 0 ? (
                <AnimatedList
                  listClassName="grid grid-cols-3 gap-2"
                  displayScrollbar={false}
                  items={entries.map((entry) => (
                    <JournalEntryCard
                      key={entry.id}
                      entryId={entry.id}
                      imageUrl={entry.image_url}
                      entryNumber={entry.entry_number}
                      title={entry.title}
                      date={entry.created_at}
                      size="small"
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
            </TabsContent>
            <TabsContent value="notes" className="w-full pt-6">
              <div className="text-center py-10">
                <p className="text-gray-500">No notes yet.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default withAuth(HomePage);
