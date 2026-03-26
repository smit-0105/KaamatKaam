import React from "react";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

const Avatar: React.FC<AvatarProps> = ({ src, name, size = "md", className = "" }) => {
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  if (src) {
    return (
      <img
        src={src}
        alt={name || "User"}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-sm ${className}`}
      />
    );
  }

  if (initials) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-primary-100 text-primary-600 font-semibold flex items-center justify-center ring-2 ring-white shadow-sm ${className}`}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-100 text-gray-400 flex items-center justify-center ring-2 ring-white shadow-sm ${className}`}>
      <User className="w-1/2 h-1/2" />
    </div>
  );
};

export default Avatar;
