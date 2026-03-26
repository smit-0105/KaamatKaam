import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-md hover:shadow-lg",
  secondary: "bg-white text-primary-500 border-2 border-primary-500 hover:bg-primary-50",
  accent: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-md hover:shadow-lg",
  danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-xl",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary", size = "md", loading = false,
  fullWidth = false, children, disabled, className = "", ...props
}) => {
  return (
    <button
      className={`
        font-semibold transition-all duration-200 transform hover:-translate-y-0.5
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
