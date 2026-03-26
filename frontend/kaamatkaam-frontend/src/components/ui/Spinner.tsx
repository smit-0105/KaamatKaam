import React from "react";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

const Spinner: React.FC<SpinnerProps> = ({ size = "md", className = "" }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 className={`${sizes[size]} animate-spin text-primary-500`} />
  </div>
);

export const PageSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
      <p className="text-gray-500 font-medium">Loading...</p>
    </div>
  </div>
);

export default Spinner;
