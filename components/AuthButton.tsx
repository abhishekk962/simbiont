"use client";

export default function AuthButton({children, variant, type}: {children: React.ReactNode, variant?: string, type: "login" | "logout"}) {
  return (
    <a
      href={type === "login" ? "/auth/login" : "/auth/logout"}
      className={`px-4 pt-3 py-2 text-2xl rounded-md ${variant === "outline" ? "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
    >
      {children}
    </a>
  );
}
