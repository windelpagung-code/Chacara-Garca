import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function Select({
  label,
  error,
  options,
  placeholder,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-semibold text-gray-700">{label}</label>
      )}
      <select
        className={`w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-gray-800 text-sm
          focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? "border-red-400 focus:ring-red-400" : ""}
          ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
