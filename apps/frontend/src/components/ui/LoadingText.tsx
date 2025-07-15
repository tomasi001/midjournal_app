"use client";

import { useState, useEffect } from "react";

const LoadingText = ({ baseText = "LOADING" }: { baseText?: string }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      setText(baseText.substring(0, index));
      index = (index + 1) % (baseText.length + 1);
    }, 300);

    return () => clearInterval(intervalId);
  }, [baseText]);

  return <>{text}</>;
};

export default LoadingText;
