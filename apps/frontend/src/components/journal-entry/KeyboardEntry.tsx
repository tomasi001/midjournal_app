"use client";

import React, { useRef, useEffect } from "react";

interface KeyboardEntryProps {
  text: string;
  setText: (text: string) => void;
}

const KeyboardEntry: React.FC<KeyboardEntryProps> = ({ text, setText }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="w-full h-full flex-grow bg-white text-black text-lg p-6 focus:outline-none resize-none"
      placeholder="Start writing..."
    />
  );
};

export default KeyboardEntry;
