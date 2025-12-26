import { useGearStore } from "@/store/useGearStore";
import { SlotPicker } from "./SlotPicker";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function GearGrid() {
  const { allSets, activeTab, addSet, removeSet } = useGearStore();

  const SLOTS = [
    "main", "sub", "range", "ammo",
    "head", "neck", "ear1", "ear2",
    "body", "hands", "ring1", "ring2",
    "back", "waist", "legs", "feet"
  ];

  const variants = Object.keys(allSets)
    .filter(name => name.split('.')[0] === activeTab)
    .sort();

  return (
    <div className="flex flex-col gap-12 py-10 max-w-5xl mx-auto px-6">
      {variants.map((setName) => {
        const [base, ...vParts] = setName.split('.');
        const variantSuffix = vParts.length > 0 ? `.${vParts.join('.')}` : "";

        return (
          <div key={setName} className="space-y-4 group/section">
            <div className="flex items-center gap-3">
              {/* --- HEADER --- */}
              <div className="ff-interactive flex items-center gap-1 cursor-pointer">
  <h2 className="text-[11px] font-black uppercase tracking-[0.3em] select-none">
    <span className="text-operator">sets.</span>
    <span className="text-lua-orange">{base}</span>
    <span className="text-lua-green">{variantSuffix}</span>
  </h2>
</div>

              <div className="h-[1px] flex-1 bg-operator/10" />

              {/* Variant Trash Button */}
              {setName.includes('.') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { if (confirm(`Delete set "${setName}"?`)) removeSet(setName); }}
                  className="w-8 h-8 text-operator hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover/section:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SLOTS.map(slot => (
                <SlotPicker key={slot} slot={slot} setName={setName} />
              ))}
            </div>
          </div>
        );
      })}

      {/* --- ADD CUSTOM VARIANT ACTION (NO CIRCLE) --- */}
      <Button
        variant="outline"
        onClick={() => {
          const sub = prompt(`Enter custom variant name for ${activeTab}:`);
          // Just pass 'sub' directly to keep the casing (e.g., Sphere)
          if (sub) addSet(`${activeTab}.${sub}`);
        }}
        /* Added border-dashed and ff-interactive for the classic hover feel */
        className="ff-window ff-interactive group flex items-center justify-center gap-2 w-full h-14 border-dashed border-operator/20 bg-transparent transition-all mt-4 hover:border-brand/50"
      >
        <Plus className="w-4 h-4 text-operator group-hover:text-brand transition-colors" />
        <span className="text-[10px] font-bold text-operator uppercase tracking-[0.2em] group-hover:text-brand transition-colors">
          Add Custom {activeTab} Variant
        </span>
      </Button>
    </div>
  );
}