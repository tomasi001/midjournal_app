import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps extends React.ComponentProps<"button"> {
  children: React.ReactNode;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ children, ...props }) => {
  return (
    <Button
      {...props}
      className="w-full bg-black text-white text-sm py-4 px-8 rounded-full hover:bg-gray-800 disabled:bg-gray-400"
    >
      {children}
    </Button>
  );
};

export default SubmitButton;
