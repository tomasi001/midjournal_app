"use client";

import {
  CameraIcon,
  DocumentTextIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/outline";
import React from "react";

interface InputToolbarProps {
  onCameraClick: () => void;
  onVoiceClick: () => void;
  onDocumentClick: () => void;
  isRecording: boolean;
}

const InputToolbar: React.FC<InputToolbarProps> = ({
  onCameraClick,
  onVoiceClick,
  onDocumentClick,
  isRecording,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={onCameraClick}
        className="w-10 h-8 flex items-center justify-center border-1 border-gray-600 rounded-full"
      >
        <CameraIcon className="h-5 w-5 text-gray-600" />
      </button>
      <button
        onClick={onVoiceClick}
        className="w-10 h-8 flex items-center justify-center border-1 border-gray-600 rounded-full"
      >
        <MicrophoneIcon
          className={`h-5 w-5 ${
            isRecording ? "text-red-500 animate-pulse" : "text-gray-600"
          }`}
        />
      </button>
      <button
        onClick={onDocumentClick}
        className="w-10 h-8 flex items-center justify-center border-1 border-gray-600 rounded-full"
      >
        <DocumentTextIcon className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

export default InputToolbar;
