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
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 
                       hover:border-blue-500/50 hover:shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)] 
                       transition-all cursor-pointer group">
          <span className="text-[10px] font-bold uppercase text-zinc-500 group-hover:text-blue-400 transition-colors">
            {slot}
          </span>
          <div className={`text-[12px] h-5 truncate ${selected ? 'text-zinc-100' : 'text-zinc-700 italic'}`}>
            {selected || "None"}
          </div>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-[220px] p-0 bg-black border-zinc-800 shadow-2xl" align="start">
        <Command className="bg-transparent">
          {/* SEARCH BAR INSIDE DROPDOWN */}
          <CommandInput placeholder={`Search ${slot}...`} className="h-9 text-xs border-none focus:ring-0" />
          <CommandList className="max-h-64 scrollbar-thin">
            <CommandEmpty className="py-2 text-center text-xs text-zinc-500">No items found.</CommandEmpty>
            <CommandGroup>
              <CommandItem 
                onSelect={() => updateSlot(setName, slot, "")} 
                className="text-zinc-500 italic text-xs cursor-pointer hover:bg-zinc-900"
              >
                Clear Slot
              </CommandItem>
              {items.map((item) => (
                <CommandItem
                  key={item}
                  onSelect={() => updateSlot(setName, slot, item)}
                  className="text-zinc-200 text-xs aria-selected:bg-blue-600 aria-selected:text-white transition-colors cursor-pointer"
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