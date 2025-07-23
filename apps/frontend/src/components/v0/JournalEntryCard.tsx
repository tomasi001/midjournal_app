import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePalette } from "color-thief-react";

interface JournalEntryCardProps {
  entryId: string;
  imageUrl?: string | null;
  entryNumber?: number;
  title?: string;
  date?: string;
  size?: "default" | "small";
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entryId,
  imageUrl,
  entryNumber,
  title,
  date,
  size = "default",
}) => {
  const { data: palette } = usePalette(imageUrl || "", 2, "hex", {
    crossOrigin: "anonymous",
  });

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      })
    : "";

  const gradient =
    palette && palette.length >= 2
      ? `linear-gradient(to right, ${palette[0]}, ${palette[1]})`
      : "linear-gradient(to right, #d1fae5, #10b981)";

  const isSmall = size === "small";

  return (
    <Link
      href={`/journal/${entryId}/result`}
      className={`block w-full overflow-hidden shadow-lg group ${
        isSmall ? "rounded-md bg-stone-50" : "rounded-2xl bg-white"
      }`}
    >
      <div className="relative w-full aspect-square">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || `Journal Entry ${entryNumber}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            {/* TODO: Calculate available processing power on device and decide to show animated iridescence or static image */}
            {/* <Iridescence /> */}
            <Image
              src="/iridescent.png"
              alt={title || `Journal Entry ${entryNumber}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </div>

      <div className="relative">
        <div
          className={`${isSmall ? "h-1" : "h-1.5"}`}
          style={{
            background: gradient,
          }}
        />
        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full ${
            isSmall ? "-top-3 w-7 h-7 p-0.5" : "-top-6 w-12 h-12 p-0.75"
          }`}
          style={{ background: gradient }}
        >
          <div
            className={`w-full h-full rounded-full flex items-center justify-center ${
              isSmall ? "bg-stone-50" : "bg-white"
            }`}
          >
            <span
              className={`font-normal text-gray-700 ${
                isSmall ? "text-[12px]" : "text-xl"
              }`}
            >
              {entryNumber}
            </span>
          </div>
        </div>

        <div
          className={`text-center ${
            isSmall ? "bg-stone-50 px-2 pt-4 pb-2" : "bg-white px-4 pt-8 pb-4"
          }`}
        >
          <h3
            className={`truncate ${
              isSmall
                ? "text-xs font-normal text-gray-800"
                : "text-lg font-semibold text-gray-800"
            }`}
          >
            {title || "Untitled"}
          </h3>
          <p
            className={`mt-1 ${
              isSmall ? "text-[10px] text-gray-500" : "text-sm text-gray-500"
            }`}
          >
            {formattedDate}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default JournalEntryCard;
