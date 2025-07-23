"use client";

import React, { useState, useRef, JSX } from "react";
import html2canvas from "html2canvas-pro";
import { usePalette } from "color-thief-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import JournalEntryCard from "./v0/JournalEntryCard";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { LinkIcon } from "lucide-react";
import InstagramIcon from "./icons/InstagramIcon";
import WhatsappIcon from "./icons/WhatsappIcon";
import TiktokIcon from "./icons/TiktokIcon";

interface ShareSheetProps {
  children: React.ReactNode;
  entry: {
    id: string;
    entry_number: number;
    title: string | null;
    created_at: string;
    image_url: string | null;
  };
}

const socialIcons = [
  {
    icon: <LinkIcon className="text-black" />,
    name: "Copy link",
  },
  { icon: <WhatsappIcon />, name: "WhatsApp" },
  { icon: <InstagramIcon />, name: "Stories" },
  { icon: <InstagramIcon />, name: "Messages" },
  { icon: <TiktokIcon />, name: "TikTok" },
  { icon: <TiktokIcon />, name: "Messages" },
];

type ShareMode = "card" | "image";

const ShareSheet: React.FC<ShareSheetProps> = ({ children, entry }) => {
  const [background, setBackground] = useState("");
  const [shareMode, setShareMode] = useState<ShareMode>("card");
  const cardRef = useRef<HTMLDivElement>(null);
  const { data: palette } = usePalette(entry.image_url || "", 2, "hex", {
    crossOrigin: "anonymous",
  });

  React.useEffect(() => {
    if (palette?.[0] && palette?.[1]) {
      setBackground(`linear-gradient(to right, ${palette[0]}, ${palette[1]})`);
    }
  }, [palette]);

  const getBackgroundStyle = (): React.CSSProperties => {
    if (background.startsWith("linear-gradient")) {
      return { backgroundImage: background, backgroundColor: "transparent" };
    }
    return { backgroundColor: background };
  };

  const handleWhatsAppShare = async () => {
    console.log("handleWhatsAppShare: Function initiated.");
    if (cardRef.current) {
      console.log(
        "handleWhatsAppShare: Card element found. Generating canvas."
      );
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          useCORS: true,
        });
        console.log("handleWhatsAppShare: Canvas generated successfully.");

        canvas.toBlob(async (blob) => {
          if (blob) {
            console.log("handleWhatsAppShare: Blob created successfully.");
            const file = new File([blob], "journal-entry.png", {
              type: "image/png",
            });
            const shareData = {
              files: [file],
              title: entry.title || "Journal Entry",
              text: "Check out this journal entry",
            };

            console.log(
              "handleWhatsAppShare: Checking if navigator.share is available."
            );
            if (navigator.canShare && navigator.canShare(shareData)) {
              console.log(
                "handleWhatsAppShare: navigator.canShare() returned true. Attempting to use Web Share API."
              );
              try {
                await navigator.share(shareData);
                console.log(
                  "handleWhatsAppShare: Web Share API was successful."
                );
                return;
              } catch (err) {
                if ((err as Error).name === "AbortError") {
                  console.log(
                    "handleWhatsAppShare: Web Share API was aborted by the user."
                  );
                  return; // User cancelled, do nothing.
                }
                console.error(
                  "handleWhatsAppShare: Error using Web Share API:",
                  err
                );
              }
            } else {
              console.log(
                "handleWhatsAppShare: Web Share API not available or cannot share data. Proceeding to fallback."
              );
            }

            // Fallback to sharing a link
            console.log(
              "handleWhatsAppShare: Executing fallback: opening WhatsApp URL."
            );
            const link = `${window.location.origin}/journal/${entry.id}/result`;
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
              `Check out this journal entry: ${link}`
            )}`;
            window.open(whatsappUrl, "_blank");
            console.log(
              `handleWhatsAppShare: Fallback executed. A new tab should have opened with URL: ${whatsappUrl}`
            );
          } else {
            console.error(
              "handleWhatsAppShare: Failed to create blob from canvas."
            );
          }
        });
      } catch (error) {
        console.error(
          "handleWhatsAppShare: Error during html2canvas execution:",
          error
        );
      }
    } else {
      console.error("handleWhatsAppShare: Card element (cardRef) not found.");
    }
  };

  const handleShare = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            if (navigator.share) {
              await navigator.share({
                files: [
                  new File([blob], "journal-entry.png", { type: "image/png" }),
                ],
                title: entry.title || "Journal Entry",
                text: `Check out this journal entry`,
              });
            } else {
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = "journal-entry.png";
              link.click();
            }
          } catch (error) {
            console.error("Error sharing:", error);
          }
        }
      });
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/journal/${entry.id}/result`;
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  };

  const renderShareIcon = (index: number, icon: JSX.Element, name: string) => (
    <div key={name + index} className="flex flex-col items-center gap-2">
      <div
        className="h-14 w-14 flex flex-col justify-center items-center"
        onClick={
          name === "Copy link"
            ? copyLink
            : name === "WhatsApp"
            ? handleWhatsAppShare
            : handleShare
        }
      >
        {icon}
      </div>
      <span className="text-black text-xs">{name}</span>
    </div>
  );

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-white">
        <DrawerHeader>
          <DrawerTitle> </DrawerTitle>
        </DrawerHeader>
        <div className="p-4 flex flex-col items-center gap-4">
          <div
            ref={cardRef}
            className={cn(
              "rounded-lg",
              shareMode === "card" && "p-4",
              background === "#ffffff" && "border-1 border-gray-200"
            )}
            style={getBackgroundStyle()}
          >
            {shareMode === "card" ? (
              <div className="w-48">
                <JournalEntryCard
                  size="share"
                  entryId={entry.id}
                  entryNumber={entry.entry_number}
                  imageUrl={entry.image_url}
                  title={entry.title ?? undefined}
                  date={entry.created_at}
                  palette={palette || undefined}
                />
              </div>
            ) : (
              <img
                src={entry.image_url!}
                alt="Journal Entry"
                className="w-56 h-[372px] rounded-lg object-cover"
              />
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border-1 border-gray-200"
              onClick={() => {
                setBackground(
                  `linear-gradient(to right, ${palette?.[0]}, ${palette?.[1]})`
                );
                setShareMode("card");
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `linear-gradient(to right, ${
                    palette?.[0] || "#d1fae5"
                  }, ${palette?.[1] || "#10b981"})`,
                }}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border-1 border-gray-200"
              onClick={() => {
                setBackground("#ffffff");
                setShareMode("card");
              }}
            >
              <div className="w-full h-full rounded-full bg-white border" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border-1 border-gray-200"
              onClick={() => {
                setBackground("#000000");
                setShareMode("card");
              }}
            >
              <div className="w-full h-full rounded-full bg-black" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border-1 border-gray-200"
              onClick={() => {
                setBackground("transparent");
                setShareMode("image");
              }}
            >
              <img
                src={entry.image_url ?? undefined}
                alt="Original"
                className="w-full h-full rounded-full object-cover"
              />
            </Button>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto p-4">
          {socialIcons.map((item, index) =>
            renderShareIcon(index, item.icon, item.name)
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ShareSheet;
