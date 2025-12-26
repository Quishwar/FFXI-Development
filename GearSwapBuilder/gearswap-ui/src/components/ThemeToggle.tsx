import { Moon, Monitor } from "lucide-react";
import { useGearStore } from "@/store/useGearStore";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useGearStore();

  const handleToggle = () => {
    const next = theme === "ffxi" ? "dark" : "ffxi";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      className="ff-interactive flex items-center gap-2 px-4 h-9 border-operator/20"
    >
      {theme === "ffxi" ? (
        <>
          <Moon className="h-4 w-4 text-operator" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-operator">
            Modern / Dark
          </span>
        </>
      ) : (
        <>
          <Monitor className="h-4 w-4 text-brand" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
            FFXI Classic
          </span>
        </>
      )}
    </Button>
  );
}



// import { Monitor, Palette } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useGearStore } from "@/store/useGearStore";

// export function ThemeToggle() {
//   const { theme, setTheme } = useGearStore();

//   return (
//     <Button
//       variant="ghost"
//       size="sm"
//       onClick={() => setTheme(theme === "dark" ? "ffxi" : "dark")}
//       className="flex items-center gap-2 text-zinc-400 hover:text-lua-blue transition-colors"
//     >
//       {theme === "dark" ? (
//         <>
//           <Monitor className="w-4 h-4" />
//           <span className="text-[10px] font-bold uppercase tracking-wider">Studio Dark</span>
//         </>
//       ) : (
//         <>
//           <Palette className="w-4 h-4 text-white" />
//           <span className="text-[10px] font-bold uppercase tracking-wider text-white">FFXI Blue</span>
//         </>
//       )}
//     </Button>
//   );
// }