import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useGearStore } from "@/store/useGearStore";
import { SLOT_ITEMS } from "@/data/items";

export function SlotPicker({ slot, setName }: { slot: string; setName: string }) {
  const { allSets, updateSlot } = useGearStore();
  const selected = allSets[setName]?.[slot] || "";
  const items = SLOT_ITEMS[slot] || [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* Container remains flex-col to keep Label top-left and Item centered */}
        <div className="ff-window ff-interactive flex flex-col p-3 min-h-[64px] cursor-pointer group relative">

          {/* 1. SLOT LABEL (Top-Left) */}
          <span className="text-[9px] font-bold uppercase text-operator group-hover:text-brand transition-colors select-none">
            {slot}
          </span>

          {/* 2. CENTERED ITEM NAME CONTAINER */}
          <div className="flex-1 flex items-center justify-center w-full">
  <div className={`text-[11px] leading-tight text-center break-words px-1 line-clamp-2 ${
    selected 
      ? 'text-foreground font-medium drop-shadow-none' // Added drop-shadow-none
      : 'text-operator italic opacity-40 drop-shadow-none'
  }`}>
    {selected || "None"}
  </div>
</div>

        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[220px] p-0 ff-window border-none shadow-2xl overflow-hidden" align="start">
        <Command className="bg-transparent [&_svg]:text-white">
          {/* Search Input - Forced to foreground color */}
          <CommandInput 
      placeholder={`Search ${slot}...`} 
      className="h-9 text-xs border-none focus:ring-0 [&_input]:text-foreground placeholder:text-operator/50" 
    />

          <CommandList className="max-h-64 custom-scrollbar">
            <CommandEmpty className="py-2 text-center text-xs text-operator">
              No items found.
            </CommandEmpty>

            <CommandGroup>
              {/* Clear Slot Button */}
              <CommandItem
                onSelect={() => updateSlot(setName, slot, "")}
                className="text-operator italic text-xs cursor-pointer hover:bg-white/10 aria-selected:bg-white/10"
              >
                [ Clear Slot ]
              </CommandItem>

              {/* Item List */}
              {items.map((item) => (
                <CommandItem
                  key={item}
                  onSelect={() => updateSlot(setName, slot, item)}
                  /* 1. text-foreground ensures it is white in FFXI mode
                     2. aria-selected:text-black ensures it is readable against the Gold highlight
                  */
                  className="text-foreground text-xs transition-colors cursor-pointer 
                       aria-selected:bg-brand aria-selected:text-black"
                >
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}