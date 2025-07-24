import React from "react";
import { cn } from "../../lib/utils";

interface HeaderProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  leftContent,
  rightContent,
  className,
}) => {
  return (
    <header className={cn("flex items-center justify-between p-4", className)}>
      <div>{leftContent}</div>
      <div>{rightContent}</div>
    </header>
  );
};

export default Header;
