import { useGearStore } from "../store/useGearStore";

// Canonical FFXI order to ensure the output is not scrambled
const SLOT_ORDER = [
  "main", "sub", "range", "ammo", 
  "head", "neck", "ear1", "ear2", 
  "body", "hands", "ring1", "ring2", 
  "back", "waist", "legs", "feet"
];

export function LuaPreview() {
  const { allSets, activeTab } = useGearStore();
  
  const visibleSets = Object.entries(allSets).filter(([name]) => 
  // This matches 'idle.Sphere' to the 'idle' tab correctly
  name === activeTab || name.startsWith(`${activeTab}.`)
);

  return (
    <div className="flex-1 w-full h-full p-6 font-mono text-[13px] overflow-auto custom-scrollbar bg-black/60 backdrop-blur-md">
      {/* FIX: Changed text-zinc-500 to text-operator 
         This makes the title White in FFXI mode and Zinc in Dark mode
      */}
      <div className="mb-6 text-[10px] font-bold text-operator uppercase tracking-[0.2em]">
        -- LUA OUTPUT
      </div>

      {visibleSets.length > 0 ? (
        visibleSets.map(([setName, gear]) => {
          const [base, ...vParts] = setName.split('.');
          const variant = vParts.length > 0 ? `.${vParts.join('.')}` : "";

          return (
            <div key={setName} className="mb-8 select-all">
              <div className="text-lua-operator">
                sets.<span className="text-lua-orange">{base}</span>
                <span className="text-lua-green">{variant}</span> = {"{"}
              </div>

              {/* Order strictly by SLOT_ORDER array */}
              {SLOT_ORDER.map((slot) => {
                // Fallback for 'range' vs 'ranged'
                const item = gear[slot] || (slot === 'range' ? gear['ranged'] : null);
                
                if (!item || item === "None") return null;

                return (
                  <div key={slot} className="pl-6 flex gap-2">
                    {/* Fixed width for slot names ensures = signs align vertically */}
                    <span className="text-lua-operator w-16 inline-block">{slot}</span>
                    <span className="text-lua-operator">=</span>
                    <span className="text-lua-green">"{item}"</span>
                    <span className="text-lua-operator">,</span>
                  </div>
                );
              })}
              
              <div className="text-lua-operator">{"}"}</div>
            </div>
          );
        })
      ) : (
        <div className="text-zinc-600 italic">No sets defined for this category.</div>
      )}
    </div>
  );
}