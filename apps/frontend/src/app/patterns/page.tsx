"use client";
import FeedbackButton from "@/components/v0/FeedbackButton";
import Header from "@/components/v0/Header";
import { withAuth } from "@/components/with-auth";
import { ChevronLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

const PatternsPage = () => {
  return (
    <div className="bg-white text-black min-h-screen">
      <Header
        leftContent={
          <Link href="/" className="flex items-center gap-2">
            <ChevronLeftIcon className="h-8 w-8 text-black" />
            <span className="text-2xl font-bold">Patterns</span>
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
      <main className="p-6"></main>
    </div>
  );
};

export default withAuth(PatternsPage);
