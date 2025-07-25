"use client";

import React, { useRef, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image"; // Importing Image from next/image

interface CameraEntryProps {
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
  onExtractText: () => void;
}

const CameraEntry: React.FC<CameraEntryProps> = ({
  capturedImage,
  setCapturedImage,
  onExtractText,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isComponentMounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (isComponentMounted) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        if (isComponentMounted) {
          console.error("CameraEntry: Error accessing camera:", err);
          toast.error("Could not access camera. Please check permissions.");
        }
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };

    if (!capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      isComponentMounted = false;
      stopCamera();
    };
  }, [capturedImage]);

  const handleTakePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL("image/png");
        setCapturedImage(dataUrl);
      }
    }
  };

  return (
    <div className="w-full h-full flex-grow flex flex-col items-center justify-center">
      {capturedImage ? (
        <>
          <Image
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-[70vh] rounded-lg"
            width={500}
            height={500}
          />
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setCapturedImage(null)}
              className="bg-gray-200 text-black px-4 py-2 rounded-lg"
            >
              Retake
            </button>
            <button
              onClick={onExtractText}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Extract Text
            </button>
          </div>
        </>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-full max-h-[70vh] rounded-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
          <button
            onClick={handleTakePicture}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Take Picture
          </button>
        </>
      )}
    </div>
  );
};

export default CameraEntry;
