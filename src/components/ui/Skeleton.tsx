interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div className={`skeleton rounded h-4 bg-gray-200 ${className}`} />
  );
}

export default function Skeleton({ lines = 3, className = "" }: SkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          className={i === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
}
