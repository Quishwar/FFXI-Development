import { useEffect } from "react";
import { TopNav } from "./components/TopNav";
import { GearGrid } from "./components/GearGrid";
import { LuaPreview } from "./components/LuaPreview";
import { Sidebar } from "./components/Sidebar"; 
import { useGearStore } from "./store/useGearStore";
import ITEM_DATA from "@/data/items.json";

export default function App() {
  const theme = useGearStore((state) => state.theme);
  const initializeItems = useGearStore(s => s.initializeItems);

  useEffect(() => {
    initializeItems(ITEM_DATA);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <TopNav />
      
      {/* This container holds everything below the header */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT: Navigation Tree (Fixed width) */}
        <Sidebar />
        
        {/* CENTER: The Grid Area - Using flex-[1.4] to give more weight to center than sidebar */}
        <main className="flex-[1.4] min-w-[600px] overflow-y-auto bg-background/50 p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
             <GearGrid />
          </div>
        </main>

        {/* RIGHT: Code Preview - Using flex-1 to make it grow/shrink proportionally */}
        {/* Removed fixed 420px, added min-width to prevent squishing */}
        <aside className="ff-window no-hand flex-1 min-w-[480px] border-l border-white/10 flex flex-col overflow-hidden bg-black/20 backdrop-blur-sm">
          <LuaPreview />
        </aside>
        
      </div>
    </div>
  );
}