import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"; // Official shadcn button
import { useGearStore } from "@/store/useGearStore";
import { X, Plus } from "lucide-react";

export function TopNav() {
  const { allSets, activeTab, setActiveTab, removeSet, addSet } = useGearStore();
  const categories = Array.from(new Set(Object.keys(allSets).map(n => n.split('.')[0])));

  const handleAddCategory = () => {
    const n = prompt("New category name (e.g., Precast, Midcast, Pet):");
    if (n) addSet(n.trim());
  };

  return (
    <header className="flex items-center px-6 h-16 border-b border-zinc-800 bg-background shrink-0">
      {/* High-Contrast Clear Logo */}
      <div className="flex items-center gap-4 pr-6 border-r border-zinc-800/50 mr-4">
        <div className="flex flex-col leading-[0.75]">
          <span className="text-[16px] font-[950] uppercase text-blue-500 tracking-[-0.06em]">
            GEARSWAP
          </span>
          <span className="text-[11px] font-black text-white uppercase tracking-[0.38em] mt-0.5">
            STUDIO
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
        <TabsList className="bg-zinc-900/40 border-zinc-800 h-11 p-1 gap-1">
          {categories.map((cat) => (
            <TabsTrigger 
              key={cat} 
              value={cat}
              asChild
            >
              <div className="relative flex items-center gap-3 h-9 px-4 cursor-pointer data-[state=active]:bg-zinc-800 data-[state=active]:text-white group transition-all rounded-md">
                <span className="text-xs font-bold capitalize select-none">{cat}</span>
                
                {cat !== 'idle' && cat !== 'engaged' && (
                  <span
                    role="button"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if(confirm(`Delete ${cat}?`)) removeSet(cat); 
                    }}
                    className="p-1 rounded-md hover:bg-red-500/20 text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </TabsTrigger>
          ))}
          
          {/* Using official shadcn Button component */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleAddCategory}
            className="h-9 w-10 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/5 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </TabsList>
      </Tabs>
    </header>
  );
}