import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Add this
import { isOdysseyItem } from "@/lib/odyssey";
import { ManualAugmentPicker } from "./manual-augment-picker";

interface AugmentModalProps {
  // Updated type to reflect the store's EquippedItem structure
  item: { 
    name: string; 
    path?: string; 
    rank?: number; 
    augments?: string[] 
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: any) => void;
}

export function AugmentModal({ item, isOpen, onOpenChange, onUpdate }: AugmentModalProps) {
  const isOdyssey = isOdysseyItem(item.name);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="ff-window border-white/10 bg-zinc-950 text-white !rounded-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-brand font-black italic uppercase tracking-widest">
            Modify {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isOdyssey ? (
            <div className="space-y-6">
              {/* Path Selection */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                  Odyssey Reinforcement Path
                </Label>
                <ToggleGroup 
                  type="single" 
                  value={item.path} 
                  onValueChange={(v) => v && onUpdate({ ...item, path: v })}
                  className="grid grid-cols-4 gap-2"
                >
                  {['A', 'B', 'C', 'D'].map((p) => (
                    <ToggleGroupItem 
                      key={p} 
                      value={p} 
                      className="ff-interactive border border-white/10 data-[state=on]:bg-brand data-[state=on]:text-black font-bold h-12"
                    >
                      {p}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Rank Input */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                  Reinforcement Rank (1 - 30)
                </Label>
                <Input 
                  type="number"
                  min={1}
                  max={30}
                  value={item.rank || ""}
                  onChange={(e) => onUpdate({ ...item, rank: parseInt(e.target.value) || 0 })}
                  className="ff-interactive bg-black/40 border-white/10 !rounded-none text-brand font-bold w-24"
                />
              </div>
            </div>
          ) : (
            /* Manual Picker for Loxotic Mace, etc. */
            <ManualAugmentPicker 
              currentAugments={item.augments || []} 
              onUpdate={(newAugs) => onUpdate({ ...item, augments: newAugs })}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}