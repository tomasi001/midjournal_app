import React from "react";
import { Button } from "@/components/ui/button";

interface LargeActionButtonProps extends React.ComponentProps<"button"> {
  children: React.ReactNode;
}

const LargeActionButton: React.FC<LargeActionButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <Button
      {...props}
      className="w-full bg-black text-white text-lg font-bold py-6 rounded-full hover:bg-gray-800 disabled:bg-gray-400"
    >
      {children}
    </Button>
  );
};

export default LargeActionButton;
