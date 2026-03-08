import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "danger" | "warning" | "info" | "default";
  size?: "sm" | "md";
}

export default function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  const variants = {
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-700",
    info: "bg-blue-100 text-blue-700",
    default: "bg-gray-100 text-gray-700",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
