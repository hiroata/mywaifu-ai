import * as React from "react";

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return <div>{children}</div>;
}

export function TabsList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex gap-2 ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, children, className = "", ...props }: { value: string; children: React.ReactNode; className?: string }) {
  // 実際のUIではonClickでonValueChangeを呼ぶ必要がありますが、
  // ここではダミー実装です。
  return (
    <button type="button" className={`px-3 py-1 rounded ${className}`} {...props}>
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }: { value: string; children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
