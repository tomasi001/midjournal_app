"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/v0/Header";
import { SparklesIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { withAuth } from "@/components/with-auth";
import { useJournalEntries } from "@/context/journal-entries-context";
import Image from "next/image";
import Iridescence from "@/components/ui/Iridescence";
import OrganicSphere from "@/components/sphere/OrganicSphere";
import { motion } from "framer-motion";

const HomePage = () => {
  const { latestEntry } = useJournalEntries();

  return (
    <div className="bg-white text-black min-h-screen">
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
      <main className="pb-6 px-6 flex flex-col items-center">
        <div className="w-full relative z-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search or ask something..."
              className="w-full border-1 border-gray-300 rounded-full py-2 pl-5 pr-12 text-md focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <SparklesIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 text-black" />
          </div>
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
            <textarea
              placeholder="Or write what's on your mind here..."
              className="w-full border-1 border-gray-300 text-gray rounded-2xl p-4 text-md focus:outline-none focus:ring-2 focus:ring-gray-300 h-32"
            />
          </Link>
        </div>

        <div className="w-full mt-8">
          <div className="flex justify-between items-center">
            <Link href="/library">
              <h3 className="text-xl font-semibold">Library</h3>
            </Link>
            <Link href="/library">
              <ChevronRightIcon className="h-6 w-6 text-gray-400" />
            </Link>
          </div>
          <Link href="/library">
            <div className="bg-gray-100 h-48 rounded-lg mt-2 relative overflow-hidden">
              {latestEntry && latestEntry.image_url ? (
                <Image
                  src={latestEntry.image_url}
                  alt="Latest journal entry"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              ) : (
                <Iridescence />
              )}
            </div>
          </Link>
        </div>
        <div className="w-full mt-12">
          <div className="flex justify-between items-center">
            <Link href="/patterns">
              <h3 className="text-xl font-semibold">Patterns</h3>
            </Link>
            <Link href="/patterns">
              <ChevronRightIcon className="h-6 w-6 text-gray-400" />
            </Link>
          </div>
          <Link href="/patterns">
            <div className="bg-gray-100 h-48 rounded-lg mt-2"></div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default withAuth(HomePage);
