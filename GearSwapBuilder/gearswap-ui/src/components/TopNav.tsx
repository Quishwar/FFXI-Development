import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useGearStore } from "@/store/useGearStore";
import { X, Plus, Download } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function TopNav() {
  const { allSets, activeTab, setActiveTab, removeSet, addSet } = useGearStore();

  const categories = Array.from(
    new Set(Object.keys(allSets).map((n) => n.split(".")[0]))
  );

  const handleAddCategory = () => {
    const n = prompt("New category name (e.g., Precast, Midcast, Pet):");
    if (n) addSet(n.trim().toLowerCase());
  };

  return (
    <header className="flex items-center justify-between px-6 h-16 border-b border-border bg-panel shrink-0">
      <div className="flex items-center gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-4 pr-6 border-r border-border/50 mr-4">
          <div className="flex flex-col leading-[0.75]">
            <h1 className="app-title text-xl font-black tracking-tighter uppercase transition-colors">
              Gearswap
            </h1>
            {/* STUDIO: Now uses text-operator (White in FFXI / Zinc in Dark) */}
            <span className="text-[11px] font-black text-operator uppercase tracking-[0.38em] mt-0.5">
              STUDIO
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="bg-background/40 border border-border h-11 p-1 gap-1">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                asChild
              >
                {/* Logic update: 
                   1. data-[state=active]:bg-brand (Gold in FFXI / Blue in Dark)
                   2. data-[state=active]:text-black (Black in FFXI / White via CSS in Dark)
                */}
                <div className="relative flex items-center gap-3 h-9 px-4 cursor-pointer rounded-md transition-all 
  text-operator 
  data-[state=active]:bg-brand 
  data-[state=active]:text-black 
  data-[state=active]:shadow-none  /* Remove any Tailwind shadows */
  group"
                >
                  <span className="text-xs font-bold capitalize select-none drop-shadow-none">
                    {cat}
                  </span>

                  {cat !== 'idle' && cat !== 'engaged' && (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete category "${cat}"?`)) removeSet(cat);
                      }}
                      className="p-1 rounded-md hover:bg-red-500/20 text-operator hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </TabsTrigger>
            ))}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddCategory}
              className="h-9 w-10 text-operator hover:text-brand hover:bg-brand/10 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </TabsList>
        </Tabs>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="h-6 w-[1px] bg-border mx-2" />

        <Button
          variant="outline"
          size="sm"
          /* Use text-brand for theme-aware action buttons */
          className="gap-2 border-brand/30 text-brand hover:bg-brand/10 transition-all ff-window border-none"
          onClick={() => alert("Generating Lua...")}
        >
          <Download className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase">Export .Lua</span>
        </Button>
      </div>
    </header>
  );
}