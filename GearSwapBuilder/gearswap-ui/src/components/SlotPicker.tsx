import React, { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useGearStore } from "@/store/useGearStore";

export function SlotPicker({ slot, setName }: { slot: string; setName: string }) {
  const { allSets, updateSlot, searchableItems } = useGearStore();
  const [search, setSearch] = useState("");

  const selected = allSets[setName]?.[slot] || "";
  const isEquipped = !!selected;

  const allItemsForSlot = useMemo(() => {
    return searchableItems[slot] || [];
  }, [searchableItems, slot]);

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase();
    return allItemsForSlot
      .filter((item: string) => !search || item.toLowerCase().includes(query))
      .slice(0, 100);
  }, [search, allItemsForSlot]);

  return (
    <div className="w-full h-full">
      <Popover>
        <PopoverTrigger asChild>
          <div className={`
            ff-window ff-interactive flex flex-col p-3 min-h-[85px] h-full cursor-pointer transition-all duration-300
            ${isEquipped ? "border-brand bg-brand/10 border-brand" : "border-white/5 bg-black/40"}
          `}>
            {/* Added 'text-operator/60' back specifically for the CSS selector */}
            <span className="text-[10px] font-black uppercase tracking-widest text-operator/60">
              {slot}
            </span>

            <div className="flex-1 flex flex-col items-center justify-center w-full py-1">
              <div className={`text-[12px] leading-tight text-center break-words px-1 line-clamp-2 ${isEquipped ? 'text-white font-bold' : 'text-operator/30 italic uppercase'}`}>
                {selected || "None"}
              </div>
            </div>

            {isEquipped && <div className="absolute inset-y-0 left-0 w-1 bg-brand" />}
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-[240px] p-0 ff-window border-none shadow-2xl z-50" align="start" sideOffset={8}>
          {/* Forces search icon to white without affecting children blue hover logic */}
          <Command shouldFilter={false} className="bg-transparent text-white">
            <CommandInput 
              placeholder={`Search ${slot}...`} 
              value={search} 
              onValueChange={setSearch}
              className="h-9 text-xs border-none focus:ring-0 text-white" 
            />
            <CommandList className="max-h-64 custom-scrollbar overflow-y-auto">
              <CommandEmpty className="p-4 text-xs text-center text-white/50">No items found.</CommandEmpty>
              <CommandGroup>
                <CommandItem 
                  onSelect={() => { updateSlot(setName, slot, ""); setSearch(""); }}
                  className="ff-interactive relative text-xs py-2 px-8 cursor-pointer border-b border-white/5 mb-1"
                >
                  <span className="opacity-70">[ Clear Slot ]</span>
                </CommandItem>
                {filteredItems.map((item: string) => (
                  <CommandItem 
                    key={item} 
                    onSelect={() => { updateSlot(setName, slot, item); setSearch(""); }}
                    className="ff-interactive relative text-xs py-2 px-8 cursor-pointer"
                  >
                    {item}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}