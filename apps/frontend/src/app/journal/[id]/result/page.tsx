"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import LargeActionButton from "@/components/v0/LargeActionButton";
import {
  ChevronLeftIcon,
  ArrowsPointingOutIcon,
  ArrowUpOnSquareIcon,
} from "@heroicons/react/24/outline";
import { withAuth } from "@/components/with-auth";
import { useAuth } from "@/context/auth-context";
import Iridescence from "@/components/ui/Iridescence";

interface JournalEntry {
  id: string;
  entry_number: number;
  title: string;
  created_at: string;
  image_url: string;
}

const JournalResultPage = () => {
  const params = useParams();
  const { token } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [formattedDate, setFormattedDate] = useState("");
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
          setFormattedDate(new Date(data.created_at).toLocaleDateString());
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

  const entryNumber = entry.entry_number;

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <Header
        leftContent={
          <Link href="/library" className="flex items-center gap-2">
            <ChevronLeftIcon className="h-8 w-8 text-black" />
            <h1 className="text-2xl font-bold">Entry {entryNumber}</h1>
          </Link>
        }
        rightContent={<FeedbackButton />}
      />
      <main className="p-6 flex justify-center flex-grow">
        <div className="relative mt-8 w-full max-w-sm">
          {/* Card container */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            {/* Image */}
            <div className="h-96 w-full bg-gray-100">
              {entry.image_url ? (
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${entry.image_url}')`,
                  }}
                ></div>
              ) : (
                <Iridescence />
              )}
            </div>

            {/* Text content */}
            <div className="pt-16 pb-6 px-6 text-center">
              <h2 className="text-3xl font-bold">
                “{entry.title || "Untitled"}”
              </h2>
              <p className="text-gray-500 mt-2">{formattedDate}</p>

              <Link
                href={`/journal/${entryId}/insights`}
                className="block mt-4"
              >
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <ArrowsPointingOutIcon className="h-6 w-6" />
                  <span className="tracking-widest">TAP CARD FOR INSIGHTS</span>
                  <ArrowUpOnSquareIcon className="h-6 w-6" />
                </div>
              </Link>
            </div>
          </div>

          {/* Badge */}
          <div className="absolute top-[320px] left-1/2 -translate-x-1/2 bg-white rounded-full w-24 h-24 flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-3xl font-bold text-gray-800">
              {entryNumber}
            </span>
          </div>
        </div>
      </main>
      <footer className="p-6">
        <Link href={`/journal/${entryId}/insights`}>
          <LargeActionButton>CONTINUE</LargeActionButton>
        </Link>
      </footer>
    </div>
  );
};

export default withAuth(JournalResultPage);
