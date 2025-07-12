import React from "react";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";

const JournalResultPage = ({ params }: { params: { id: string } }) => {
  // Using a static number for now as per the design.
  const entryNumber = 71;

  return (
    <div className="bg-white text-black min-h-screen">
      <Header
        leftContent={
          <h1 className="text-2xl font-bold">Entry {entryNumber}</h1>
        }
        rightContent={<FeedbackButton />}
      />
      <main className="p-6 flex justify-center">
        <div className="relative mt-8 w-full max-w-sm">
          {/* Card container */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden pb-24">
            {/* Image Placeholder */}
            <div className="bg-gray-200 h-96 w-full"></div>
            {/* Text content will go here in the next commit */}
          </div>

          {/* Badge, positioned relative to the card container */}
          <div className="absolute top-[320px] left-1/2 -translate-x-1/2 bg-white rounded-full w-24 h-24 flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-3xl font-bold text-gray-800">
              {entryNumber}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JournalResultPage;
