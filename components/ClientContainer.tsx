"use client";

export default function ClientContainer({
  children,
  className
}: {
  children: React.ReactNode;
    className?: string;
}) {
  return <div className={className}>{children}</div>;
}
