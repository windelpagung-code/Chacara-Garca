import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          className={`w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-800 placeholder-gray-400 text-sm
            focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
            disabled:bg-gray-50 disabled:text-gray-500
            ${icon ? "pl-9" : ""}
            ${error ? "border-red-400 focus:ring-red-400" : ""}
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
