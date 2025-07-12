import React from "react";

interface HeaderProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ leftContent, rightContent }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-black text-white">
      <div>{leftContent}</div>
      <div>{rightContent}</div>
    </header>
  );
};

export default Header;
