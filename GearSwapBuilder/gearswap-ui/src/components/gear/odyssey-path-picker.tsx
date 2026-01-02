// src/components/gear/odyssey-path-picker.tsx

import * as React from "react";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PATH_ENABLED_ITEMS } from "@/constants/odyssey";

interface OdysseyPathPickerProps {
  itemName: string;
  value?: string;
  onValueChange: (path: string) => void;
}

export function OdysseyPathPicker({
  itemName,
  value,
  onValueChange,
}: OdysseyPathPickerProps) {
  // Use the verified whitelist from your screens
  const isOdyssey = PATH_ENABLED_ITEMS.some((item) => 
    itemName.toLowerCase().includes(item)
  );

  if (!isOdyssey) return null;

  return (
    <div className="grid gap-3 pt-4 border-t mt-4">
      <div className="flex flex-col gap-1">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Odyssey Reinforcement Path
        </Label>
      </div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(val) => val && onValueChange(val)}
        className="flex gap-2 justify-start"
      >
        {["A", "B", "C", "D"].map((path) => (
          <ToggleGroupItem
            key={path}
            value={path}
            variant="outline"
            className="w-full font-bold data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Path {path}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}