import { useState } from "react";
import { School } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  imageClassName?: string;
  src?: string;
}

export default function LogoMark({
  className,
  imageClassName,
  src = "/logo-192x192.png",
}: LogoMarkProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <span
      className={cn(
        "inline-flex w-16 h-16 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-border overflow-hidden shrink-0",
        className,
      )}
      aria-label="Logo PAUD Tunas GenQuPa"
    >
      {hasError ? (
        <School className="h-1/2 w-1/2 text-primary" aria-hidden="true" />
      ) : (
        <img
          src={src}
          alt="Logo PAUD Tunas GenQuPa"
          className={cn("w-16 h-16 object-contain", imageClassName)}
          onError={() => setHasError(true)}
        />
      )}
    </span>
  );
}