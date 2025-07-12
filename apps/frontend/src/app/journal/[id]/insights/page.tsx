import React from "react";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import LargeActionButton from "@/components/v0/LargeActionButton";

const JournalInsightsPage = ({ params }: { params: { id: string } }) => {
  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <Header
        leftContent={<h1 className="text-2xl font-bold">Insights</h1>}
        rightContent={<FeedbackButton />}
      />
      <main className="p-6 flex flex-col items-center flex-grow">
        <div
          className="mt-8 w-40 h-40 rounded-full bg-cover bg-center shadow-lg"
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
        <LargeActionButton>FINISH</LargeActionButton>
      </footer>
    </div>
  );
};

export default JournalInsightsPage;
