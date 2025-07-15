"use client";

import React from "react";

interface JournalEntryComposerProps {
  text: string;
  setText: (text: string) => void;
}

const JournalEntryComposer: React.FC<JournalEntryComposerProps> = ({
  text,
  setText,
}) => {
  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="w-full h-full flex-grow bg-white text-black text-lg p-6 focus:outline-none resize-none"
      placeholder="Go deep, understand yourself better..."
      autoFocus
    />
  );
};

export default JournalEntryComposer;
