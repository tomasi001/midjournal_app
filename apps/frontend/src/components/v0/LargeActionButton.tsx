import React from 'react';
import { Button } from '@/components/ui/button';

interface LargeActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

const LargeActionButton: React.FC<LargeActionButtonProps> = ({ children, onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="w-full bg-black text-white text-lg font-bold py-6 rounded-full hover:bg-gray-800"
    >
      {children}
    </Button>
  );
};

export default LargeActionButton; 