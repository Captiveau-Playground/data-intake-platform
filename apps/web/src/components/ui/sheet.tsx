"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return <>{children}</>;
}

function SheetOverlay({
  className,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/80 animate-in fade-in-0",
        className
      )}
      onClick={onClick}
      {...props}
    />
  );
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose: () => void;
  side?: "left" | "right";
}

function SheetContent({
  className,
  children,
  onClose,
  side = "left",
  ...props
}: SheetContentProps) {
  return (
    <>
      <SheetOverlay onClick={onClose} />
      <div
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition-transform duration-300",
          side === "left" && "inset-y-0 left-0 h-full w-72 border-r animate-in slide-in-from-left",
          side === "right" && "inset-y-0 right-0 h-full w-72 border-l animate-in slide-in-from-right",
          className
        )}
        {...props}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </>
  );
}

export { Sheet, SheetOverlay, SheetContent };
