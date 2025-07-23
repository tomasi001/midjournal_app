import { usePalette } from "color-thief-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface JournalEntryCardProps {
  entryId: string;
  imageUrl?: string | null;
  entryNumber?: number;
  title?: string;
  date?: string;
  size?: "default" | "small" | "large" | "share";
  palette?: string[] | null;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entryId,
  imageUrl,
  entryNumber,
  title,
  date,
  size = "default",
  palette: paletteProp,
}) => {
  const { data: paletteFromHook } = usePalette(
    paletteProp ? "" : imageUrl || "",
    2,
    "hex",
    {
      crossOrigin: "anonymous",
    }
  );
  const palette = paletteProp || paletteFromHook;

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
  const isShare = size === "share";

  const href = isLarge
    ? `/journal/${entryId}/insights`
    : `/journal/${entryId}/result`;

  return (
    <Link
      href={href}
      className={`block w-full overflow-hidden group ${
        isShare
          ? "rounded bg-stone-50 shadow-md"
          : isSmall
          ? "rounded-md bg-stone-50 shadow-lg"
          : isLarge
          ? "rounded-lg bg-stone-50 shadow-xl"
          : "rounded-2xl bg-white shadow-lg"
      }`}
    >
      <div
        className={`relative w-full ${
          isLarge || isShare ? "aspect-[330/497]" : "aspect-square"
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
          className={`${
            isShare ? "h-0.5" : isSmall || isLarge ? "h-1" : "h-1.5"
          }`}
          style={{
            background: gradient,
          }}
        />
        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full ${
            isShare
              ? "-top-2 w-5 h-5 p-0.5"
              : isSmall
              ? "-top-3 w-7 h-7 p-0.5"
              : isLarge
              ? "-top-9 w-[74px] h-[70px] p-1"
              : "-top-6 w-12 h-12 p-0.75"
          }`}
          style={{ background: gradient }}
        >
          <div
            className={`w-full h-full rounded-full flex items-center justify-center ${
              isShare || isSmall || isLarge ? "bg-stone-50" : "bg-white"
            }`}
          >
            <span
              className={`text-gray-700 ${
                isShare
                  ? "text-[10px] font-normal"
                  : isSmall
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
            isShare
              ? "bg-stone-50 px-1 pt-3 pb-1"
              : isSmall
              ? "bg-stone-50 px-2 pt-4 pb-2"
              : isLarge
              ? "bg-stone-50 px-4 pt-12 pb-4"
              : "bg-white px-4 pt-8 pb-4"
          }`}
        >
          <h3
            className={`truncate ${
              isShare
                ? "text-[10px] font-normal text-gray-800"
                : isSmall
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
              isShare
                ? "text-[8px] text-gray-500"
                : isSmall
                ? "text-[10px] text-gray-500"
                : isLarge
                ? "text-[13px] text-gray-500"
                : "text-sm text-gray-500"
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
