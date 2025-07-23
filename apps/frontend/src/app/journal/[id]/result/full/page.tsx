"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Share } from "lucide-react";
import { withAuth } from "@/components/with-auth";

interface JournalEntry {
  image_url: string | null;
}

const FullScreenImagePage = () => {
  const params = useParams();
  const { token } = useAuth();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const entryId = params.id;

  useEffect(() => {
    const fetchEntry = async () => {
      if (!token || !entryId) return;
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

    fetchEntry();
  }, [entryId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 text-black">
        Loading...
      </div>
    );
  }

  if (!entry || !entry.image_url) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100 text-black">
        <header className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center">
          <Link href={`/journal/${entryId}/result`}>
            <ArrowLeftIcon className="h-6 w-6 text-black" />
          </Link>
        </header>
        <p>Image not found.</p>
        <Link
          href={`/journal/${entryId}/result`}
          className="text-blue-500 mt-4"
        >
          Go back
        </Link>
      </div>
    );
  }

  return (
    <div
      className="relative w-screen h-screen bg-cover bg-center"
      style={{ backgroundImage: `url('${entry.image_url}')` }}
    >
      <header className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center">
        <Link href={`/journal/${entryId}/result`}>
          <ArrowLeftIcon className="h-6 w-6 text-black" />
        </Link>
        <Share className="h-6 w-6 text-black" />
      </header>
    </div>
  );
};

export default withAuth(FullScreenImagePage);
