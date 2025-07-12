"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/v0/Header";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { PlusIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { withAuth } from "@/components/with-auth";

const HomePage = () => {
  return (
    <div className="bg-white text-black min-h-screen">
      <Header
        leftContent={
          <h1 className="text-2xl font-bold text-black">Midjournal</h1>
        }
        rightContent={<UserCircleIcon className="h-10 w-10 text-black" />}
      />
      <main className="p-6 flex flex-col items-center">
        <div className="text-center mt-8">
          <h2 className="text-2xl">Welcome back, X</h2>
          <p className="text-gray-500 mt-2">Ready to make your next entry?</p>
        </div>

        <Link href="/journal/entry" className="mt-12">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full w-40 h-40 flex items-center justify-center mx-auto shadow-md">
            <PlusIcon className="h-24 w-24 text-gray-500" />
          </button>
        </Link>

        <div className="w-full mt-12">
          <div className="flex justify-between items-center">
            <Link href="/patterns">
              <h3 className="text-xl font-semibold">Patterns</h3>
            </Link>
            <Link href="/patterns">
              <ChevronRightIcon className="h-6 w-6 text-gray-400" />
            </Link>
          </div>
          <Link href="/patterns">
            <div className="bg-gray-100 h-48 rounded-lg mt-2"></div>
          </Link>
        </div>

        <div className="w-full mt-8">
          <div className="flex justify-between items-center">
            <Link href="/library">
              <h3 className="text-xl font-semibold">Library</h3>
            </Link>
            <Link href="/library">
              <ChevronRightIcon className="h-6 w-6 text-gray-400" />
            </Link>
          </div>
          <Link href="/library">
            <div className="bg-gray-100 h-48 rounded-lg mt-2"></div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default withAuth(HomePage);
