import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-soft border border-gray-100 p-6 ${className}`}
    >
      {children}
    </div>
  );
};