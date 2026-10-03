"use client";

import { useState, type ComponentProps } from "react";
import { Dices, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// No look-alike characters (0/O, 1/l/I) so a generated password can be read out or typed.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generatePassword(length = 16) {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join("");
}

/** Password field with a show/hide toggle and, optionally, a random-password generator. */
export function PasswordInput({ generate = false, ...props }: ComponentProps<typeof Input> & { generate?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          {...props}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-primary"
          aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {generate && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setValue(generatePassword());
            setVisible(true);
          }}
        >
          <Dices />
          สุ่ม
        </Button>
      )}
    </div>
  );
}
