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
      className="w-full bg-[#333333] text-[#F9F9F9] text-lg font-bold py-6 rounded-[5px] hover:bg-gray-800 disabled:bg-gray-400"
    >
      {children}
    </Button>
  );
};

export default LargeActionButton;
