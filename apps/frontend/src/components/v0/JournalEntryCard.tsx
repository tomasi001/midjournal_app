import React from "react";
import Image from "next/image";
import Link from "next/link";
import Iridescence from "@/components/ui/Iridescence";

interface JournalEntryCardProps {
  entryId: string;
  imageUrl?: string | null;
  entryNumber?: number;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entryId,
  imageUrl,
  entryNumber,
}) => {
  if (!imageUrl) {
    return (
      <div className="aspect-[2/3] rounded-lg bg-gray-100 overflow-hidden">
        <Iridescence />
      </div>
    );
  }

  return (
    <Link href={`/journal/${entryId}/result`} className="relative block group">
      <Image
        src={imageUrl}
        alt={`Journal Entry ${entryNumber}`}
        width={400}
        height={600}
        className="aspect-[2/3] rounded-lg object-cover transition-opacity group-hover:opacity-75"
      />
    </Link>
  );
};

export default JournalEntryCard;
