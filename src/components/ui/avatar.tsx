import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Avatar({ src, alt, children, className = "" }: AvatarProps) {
  return (
    <div
      className={`relative inline-block rounded-full overflow-hidden bg-gray-200 ${className}`}
      style={{ width: 40, height: 40 }}
    >
      {src ? (
        <img src={src} alt={alt} className="object-cover w-full h-full" />
      ) : (
        <span className="flex items-center justify-center w-full h-full text-lg font-bold text-gray-500">
          {children}
        </span>
      )}
    </div>
  );
}

export function AvatarImage({ src, alt }: { src?: string; alt?: string }) {
  return src ? (
    <img src={src} alt={alt} className="object-cover w-full h-full" />
  ) : null;
}

export function AvatarFallback({ children }: { children?: React.ReactNode }) {
  return <span>{children}</span>;
}
