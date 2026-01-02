import React from "react";
import { useGearStore, EquippedItem } from "../store/useGearStore";

// Mapping internal IDs to your specific Gearswap Slot Names
const SLOT_MAP: Record<string, string> = {
  main: "main", sub: "sub", range: "range", ammo: "ammo",
  head: "head", neck: "neck", 
  ear1: "left_ear", ear2: "right_ear",
  body: "body", hands: "hands", 
  ring1: "left_ring", ring2: "right_ring",
  back: "back", waist: "waist", legs: "legs", feet: "feet"
};

const SLOT_ORDER = [
  "main", "sub", "range", "ammo", "head", "body", "hands", 
  "legs", "feet", "neck", "waist", "ear1", "ear2", "ring1", "ring2", "back"
];

export function LuaPreview() {
  const { allSets, activeTab } = useGearStore();

  const visibleSets = Object.entries(allSets).filter(([name]) => {
    return name === activeTab || name.startsWith(`${activeTab}.`);
  });

  return (
    <div className="flex-1 w-full h-full p-6 font-mono text-[13px] overflow-auto custom-scrollbar border-l border-white/10
                    bg-[#0a0a0c] [[data-theme='ffxi']_&]:bg-[linear-gradient(180deg,#000080_0%,#000033_100%)]">
      
      {visibleSets.map(([setName, gear]) => {
        const [base, ...vParts] = setName.split('.');
        const variant = vParts.length > 0 ? `.${vParts.join('.')}` : "";

        return (
          <div key={setName} className="mb-8 select-all leading-normal">
            <div className="text-zinc-400">
              sets.<span className="text-amber-500">{base}</span>
              <span className="text-emerald-500">{variant}</span> = {" {"}
            </div>

            {SLOT_ORDER.map((slotKey) => {
              const itemData = gear[slotKey];
              const gearswapSlotName = SLOT_MAP[slotKey];
              
              if (!itemData || itemData === "None" || itemData === "empty" || itemData === "") return null;

              // --- STRING RENDER ---
              if (typeof itemData === 'string') {
                return (
                  <div key={slotKey} className="pl-4 whitespace-nowrap">
                    <span className="text-sky-400">{gearswapSlotName}</span>
                    <span className="text-zinc-400">="</span>
                    <span className="text-emerald-400">{itemData}</span>
                    <span className="text-zinc-400">",</span>
                  </div>
                );
              }

              // --- OBJECT RENDER (Matches your spacing and brace style) ---
              const item = itemData as EquippedItem;
              const displayAugs: string[] = [];
              if (item.path) displayAugs.push(`Path: ${item.path}`);
              if (item.augments) displayAugs.push(...item.augments);

              return (
                <div key={slotKey} className="pl-4 whitespace-nowrap">
                  <span className="text-sky-400">{gearswapSlotName}</span>
                  <span className="text-zinc-400">={"{ "}</span>
                  <span className="text-sky-300">name</span>
                  <span className="text-zinc-400">="</span>
                  <span className="text-emerald-400">{item.name}</span>
                  <span className="text-zinc-400">", </span>
                  
                  {displayAugs.length > 0 && (
                    <>
                      <span className="text-sky-300">augments</span>
                      <span className="text-zinc-400">={"{"}</span>
                      <span className="text-emerald-200">
                        {displayAugs.map((a, i) => (
                          <React.Fragment key={i}>
                            '{a.trim()}'{i < displayAugs.length - 1 ? "," : ""}
                          </React.Fragment>
                        ))}
                      </span>
                      <span className="text-zinc-400">{"}"}</span>
                    </>
                  )}
                  <span className="text-zinc-400">{"},"}</span>
                </div>
              );
            })}

            <div className="text-zinc-400">{"}"}</div>
          </div>
        );
      })}
    </div>
  );
}