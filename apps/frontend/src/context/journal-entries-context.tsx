"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./auth-context";

export interface JournalEntry {
  id: string;
  entry_number: number;
  image_url: string;
}

interface JournalEntriesContextType {
  entries: JournalEntry[];
  loading: boolean;
  hasMore: boolean;
  loadMoreEntries: () => void;
  latestEntry: JournalEntry | null;
  refreshEntries: () => void;
}

const JournalEntriesContext = createContext<
  JournalEntriesContextType | undefined
>(undefined);

export const useJournalEntries = () => {
  const context = useContext(JournalEntriesContext);
  if (!context) {
    throw new Error(
      "useJournalEntries must be used within a JournalEntriesProvider"
    );
  }
  return context;
};

interface JournalEntriesProviderProps {
  children: ReactNode;
}

export const JournalEntriesProvider: React.FC<JournalEntriesProviderProps> = ({
  children,
}) => {
  const { token } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const [latestEntry, setLatestEntry] = useState<JournalEntry | null>(null);

  const fetchEntries = useCallback(
    async (currentOffset: number) => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(
          `/api/journal/entries?limit=${limit}&offset=${currentOffset}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data: JournalEntry[] = await response.json();
          setEntries((prevEntries) =>
            currentOffset === 0 ? data : [...prevEntries, ...data]
          );

          if (currentOffset === 0 && data.length > 0) {
            setLatestEntry(data[0]);
          } else if (currentOffset === 0) {
            setLatestEntry(null);
          }

          setOffset(currentOffset + data.length);
          setHasMore(data.length === limit);
        } else {
          console.error("Failed to fetch journal entries.");
          setHasMore(false);
        }
      } catch (error) {
        console.error(
          "An error occurred while fetching journal entries:",
          error
        );
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token && entries.length === 0 && hasMore) {
      fetchEntries(0);
    }
  }, [token, entries.length, fetchEntries, hasMore]);

  const loadMoreEntries = useCallback(() => {
    if (hasMore && !loading) {
      fetchEntries(offset);
    }
  }, [hasMore, loading, offset, fetchEntries]);

  const refreshEntries = useCallback(() => {
    setOffset(0);
    setHasMore(true);
    fetchEntries(0);
  }, [fetchEntries]);

  const value = {
    entries,
    loading,
    hasMore,
    loadMoreEntries,
    latestEntry,
    refreshEntries,
  };

  return (
    <JournalEntriesContext.Provider value={value}>
      {children}
    </JournalEntriesContext.Provider>
  );
};
