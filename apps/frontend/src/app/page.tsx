import React from "react";
import Header from "@/components/v0/Header";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { PlusIcon } from "@heroicons/react/24/outline";

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

        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full w-40 h-40 flex items-center justify-center mx-auto mt-12 shadow-md">
          <PlusIcon className="h-24 w-24 text-gray-500" />
        </button>
      </main>
    </div>
  );
};

export default HomePage;
