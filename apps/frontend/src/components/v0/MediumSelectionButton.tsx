import React from "react";

interface MediumSelectionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
}

const MediumSelectionButton: React.FC<MediumSelectionButtonProps> = ({
  icon,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-2 shadow-md"
    >
      {icon}
    </button>
  );
};

export default MediumSelectionButton;
