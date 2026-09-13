import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function copyText(text: string, ok = "Copied") {
  return navigator.clipboard.writeText(text).then(
    () => {
      toast(ok);
      return true;
    },
    () => {
      toast("Could not copy — select the text instead");
      return false;
    },
  );
}

export function CopyButton({
  text,
  label = "Copy",
  done = "Copied",
  variant = "outline",
  size = "sm",
  className,
}: {
  text: string;
  label?: string;
  done?: string;
  variant?: "default" | "outline" | "ghost" | "paper";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={async () => {
        const ok = await copyText(text, done);
        if (ok) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        }
      }}
    >
      {copied ? <Check /> : <Copy />}
      {label}
    </Button>
  );
}
