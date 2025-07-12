import React from "react";
import Link from "next/link";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import LargeActionButton from "@/components/v0/LargeActionButton";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

const JournalInsightsPage = ({ params }: { params: { id: string } }) => {
  const entryId = params.id;

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
        <div
          className="mt-8 w-40 h-40 rounded-full bg-cover bg-center shadow-lg flex-shrink-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop')",
          }}
        ></div>

        <div className="mt-8 px-4 w-full">
          <h2 className="text-2xl font-bold mb-4">Insights</h2>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>2 sentence summary of entry</li>
            <li>emotional valence</li>
            <li>emotional arousal</li>
            <li>top 3 most emotions detected</li>
            <li>key themes/topics spoken about</li>
            <li>
              What these themes might mean and why (linked to relevant reading
              materials)
            </li>
            <li>Follow up queries and chance to extend on entry</li>
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

export default JournalInsightsPage;
