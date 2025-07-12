import React from "react";
import Link from "next/link";
import Header from "@/components/v0/Header";
import FeedbackButton from "@/components/v0/FeedbackButton";
import MediumSelectionButton from "@/components/v0/MediumSelectionButton";
import LargeActionButton from "@/components/v0/LargeActionButton";
import {
  ChevronLeftIcon,
  ComputerDesktopIcon,
  MicrophoneIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";

const JournalEntryPage = () => {
  return (
    <div className="bg-white text-black min-h-screen flex flex-col">
      <Header
        leftContent={
          <Link href="/" className="flex items-center">
            <ChevronLeftIcon className="h-8 w-8 text-black" />
            <span className="ml-2 text-2xl font-bold">Journal</span>
          </Link>
        }
        rightContent={<FeedbackButton />}
      />
      <main className="p-6 flex flex-col items-center flex-grow">
        <p className="text-gray-500 mt-16">Choose your medium to begin:</p>
        <div className="flex mt-4">
          <MediumSelectionButton
            icon={<ComputerDesktopIcon className="h-10 w-10 text-gray-600" />}
          />
          <MediumSelectionButton
            icon={<MicrophoneIcon className="h-10 w-10 text-gray-600" />}
          />
          <MediumSelectionButton
            icon={<CameraIcon className="h-10 w-10 text-gray-600" />}
          />
        </div>
      </main>
      <footer className="p-6">
        <LargeActionButton>SUBMIT</LargeActionButton>
      </footer>
    </div>
  );
};

export default JournalEntryPage;
