import React from "react";
import Link from "next/link";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import LargeActionButton from "@/components/v0/LargeActionButton";
import {
  ArrowsPointingOutIcon,
  ArrowUpOnSquareIcon,
} from "@heroicons/react/24/outline";

const JournalResultPage = ({ params }: { params: { id: string } }) => {
  // Using a static number for now as per the design.
  const entryNumber = 71;
  const entryId = params.id;

  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <Header
        leftContent={
          <h1 className="text-2xl font-bold">Entry {entryNumber}</h1>
        }
        rightContent={<FeedbackButton />}
      />
      <main className="p-6 flex justify-center flex-grow">
        <div className="relative mt-8 w-full max-w-sm">
          {/* Card container */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            {/* Image Placeholder */}
            <div className="bg-gray-200 h-96 w-full"></div>

            {/* Text content */}
            <div className="pt-16 pb-6 px-6 text-center">
              <h2 className="text-3xl font-bold">“Working it out”</h2>
              <p className="text-gray-500 mt-2">26/01/25</p>

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
        <LargeActionButton>CONTINUE</LargeActionButton>
      </footer>
    </div>
  );
};

export default JournalResultPage;
