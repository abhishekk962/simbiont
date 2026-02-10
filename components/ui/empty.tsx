function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={
        className
          ? `flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12 ${className}`
          : "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12"
      }
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={
        className
          ? `flex max-w-sm flex-col items-center gap-2 text-center ${className}`
          : "flex max-w-sm flex-col items-center gap-2 text-center"
      }
      {...props}
    />
  )
}

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: "default" | "icon" }) {
  const baseClasses = "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0";
  const variantClasses = variant === "icon" 
    ? "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6"
    : "bg-transparent";
  
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={
        className
          ? `${baseClasses} ${variantClasses} ${className}`
          : `${baseClasses} ${variantClasses}`
      }
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={
        className
          ? `text-lg font-medium tracking-tight ${className}`
          : "text-lg font-medium tracking-tight"
      }
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={
        className
          ? `text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4 ${className}`
          : "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4"
      }
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={
        className
          ? `flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance ${className}`
          : "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance"
      }
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
