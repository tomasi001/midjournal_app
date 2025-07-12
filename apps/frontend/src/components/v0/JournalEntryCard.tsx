import React from "react";
import Link from "next/link";

interface JournalEntryCardProps {
  entryId: string;
  imageUrl: string;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entryId,
  imageUrl,
}) => {
  return (
    <Link href={`/journal/${entryId}/result`}>
      <div
        className="aspect-[2/3] rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>
    </Link>
  );
};

export default JournalEntryCard;
