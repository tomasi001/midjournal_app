"use client";

import Header from "@/components/v0/Header";
import SignOutButton from "@/components/v0/SignOutButton";
import { withAuth } from "@/components/with-auth";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { PwaManager } from "@/components/pwa/PwaManager";

const ProfilePage = () => {
  return (
    <div className="bg-white text-black min-h-screen">
      <Header
        leftContent={
          <Link href="/" className="flex items-center gap-2">
            <ChevronLeftIcon className="h-8 w-8 text-black" />
            <span className="text-2xl font-bold">Profile</span>
          </Link>
        }
        rightContent={
          <div className="flex items-center gap-4">
            <SignOutButton />
          </div>
        }
      />
      <main className="p-6">
        <PwaManager mode="inline" />
      </main>
    </div>
  );
};

export default withAuth(ProfilePage);
