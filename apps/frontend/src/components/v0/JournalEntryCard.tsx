import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePalette } from "color-thief-react";
import {
  ArrowsPointingOutIcon,
  ArrowUpOnSquareIcon,
} from "@heroicons/react/24/outline";

interface JournalEntryCardProps {
  entryId: string;
  imageUrl?: string | null;
  entryNumber?: number;
  title?: string;
  date?: string;
  size?: "default" | "small" | "large";
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
  const isLarge = size === "large";

  const href = isLarge
    ? `/journal/${entryId}/insights`
    : `/journal/${entryId}/result`;

  return (
    <Link
      href={href}
      className={`block w-full overflow-hidden group ${
        isSmall
          ? "rounded-md bg-stone-50 shadow-lg"
          : isLarge
          ? "rounded-lg bg-stone-50 shadow-xl"
          : "rounded-2xl bg-white shadow-lg"
      }`}
    >
      <div
        className={`relative w-full ${
          isLarge ? "aspect-[330/497]" : "aspect-square"
        }`}
      >
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
          className={`${isSmall || isLarge ? "h-1" : "h-1.5"}`}
          style={{
            background: gradient,
          }}
        />
        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full ${
            isSmall
              ? "-top-3 w-7 h-7 p-0.5"
              : isLarge
              ? "-top-9 w-[74px] h-[70px] p-1"
              : "-top-6 w-12 h-12 p-0.75"
          }`}
          style={{ background: gradient }}
        >
          <div
            className={`w-full h-full rounded-full flex items-center justify-center ${
              isSmall || isLarge ? "bg-stone-50" : "bg-white"
            }`}
          >
            <span
              className={`text-gray-700 ${
                isSmall
                  ? "text-[12px] font-normal"
                  : isLarge
                  ? "text-[26px] font-normal"
                  : "text-xl font-bold"
              }`}
            >
              {entryNumber}
            </span>
          </div>
        </div>

        <div
          className={`text-center ${
            isSmall
              ? "bg-stone-50 px-2 pt-4 pb-2"
              : isLarge
              ? "bg-stone-50 px-4 pt-12 pb-4"
              : "bg-white px-4 pt-8 pb-4"
          }`}
        >
          <h3
            className={`truncate ${
              isSmall
                ? "text-xs font-normal text-gray-800"
                : isLarge
                ? "text-base font-normal text-gray-800"
                : "text-lg font-semibold text-gray-800"
            }`}
          >
            &quot;{title || "Untitled"}&quot;
          </h3>
          <p
            className={`mt-1 ${
              isSmall
                ? "text-[10px] text-gray-500"
                : isLarge
                ? "text-[13px] text-gray-500"
                : "text-sm text-gray-500"
            }`}
          >
            {formattedDate}
          </p>
          {/* {isLarge && title && (
            <div className="flex justify-between items-center text-sm text-gray-400 mt-4 px-2">
              <ArrowsPointingOutIcon className="h-6 w-6" />
              <span className="tracking-widest">TAP CARD FOR INSIGHTS</span>
              <ArrowUpOnSquareIcon className="h-6 w-6" />
            </div>
          )} */}
        </div>
      </div>
    </Link>
  );
};

export default JournalEntryCard;
