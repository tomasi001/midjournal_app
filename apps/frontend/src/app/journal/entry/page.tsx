import React from "react";
import Link from "next/link";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

const JournalEntryPage = () => {
  return (
    <div className="bg-white text-black min-h-screen">
      <Header
        leftContent={
          <Link href="/" className="flex items-center">
            <ChevronLeftIcon className="h-8 w-8 text-black" />
            <span className="ml-2 text-2xl font-bold">Journal</span>
          </Link>
        }
        rightContent={<FeedbackButton />}
      />
      <main className="p-6 flex flex-col items-center">
        <p className="text-gray-500 mt-16">Choose your medium to begin:</p>
      </main>
    </div>
  );
};

export default JournalEntryPage;
