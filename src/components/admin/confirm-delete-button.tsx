"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Submit button for a delete form that asks for confirmation first. */
export function ConfirmDeleteButton({ message, label = "ลบ" }: { message: string; label?: string }) {
  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      className="text-destructive hover:bg-destructive/10"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      <Trash2 />
      {label}
    </Button>
  );
}
