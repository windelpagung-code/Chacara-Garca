import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}
      <textarea
        className={`w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-800 placeholder-gray-400 text-sm resize-none
          focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
          ${error ? "border-red-400 focus:ring-red-400" : ""}
          ${className}`}
        rows={props.rows ?? 3}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
