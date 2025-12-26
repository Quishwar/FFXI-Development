import tkinter as tk
import os
import time
import winsound
import glob
import re
from threading import Thread
from playsound import playsound

# --- CONFIGURATION ---
LOG_FOLDER_PATTERN = r"F:\Windower\logs\*.log"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MP3_FILE = os.path.join(BASE_DIR, "incoming.mp3")
WATCHLIST_FILE = os.path.join(BASE_DIR, "watchlist.txt")

class BattleMonitor:
    def __init__(self, root):
        self.root = root
        self.root.title("FFXI Battle Watch")
        self.root.geometry("400x300")
        self.root.attributes("-topmost", True)
        self.root.configure(bg='black')

        self.watchlist = {}
        self.start_time = None
        self.in_combat = False

        self.label = tk.Label(root, text="WAITING FOR LOGS...", font=("Helvetica", 22, "bold"), fg="white", bg="black", wraplength=380)
        self.label.pack(expand=True, fill='both')

        self.status_label = tk.Label(root, text="Moves Loaded: 0", font=("Helvetica", 10), fg="#888888", bg="black")
        self.status_label.pack()

        self.timer_label = tk.Label(root, text="00:00", font=("Courier", 14), fg="#666666", bg="black")
        self.timer_label.pack(pady=5)

        # Initial Load
        self.load_watchlist()

        self.thread = Thread(target=self.run_monitor, daemon=True)
        self.thread.start()

    def load_watchlist(self):
        """Builds a clean Dictionary from the text file"""
        new_watchlist = {}
        if not os.path.exists(WATCHLIST_FILE):
            self.status_label.config(text="FILE NOT FOUND", fg="red")
            return

        try:
            with open(WATCHLIST_FILE, "r", encoding="utf-8-sig") as f:
                for line in f:
                    # 1. Ignore empty lines or comments
                    clean_line = line.strip()
                    if not clean_line or "," not in clean_line:
                        continue
                    
                    # 2. Split into Move and Level
                    parts = clean_line.rsplit(",", 1)
                    
                    # 3. Clean the move name (remove quotes, colons, and outer spaces)
                    move_name = parts[0].strip().replace('"', '').replace("'", "").replace(':', '')
                    
                    # 4. Clean the level (ensure it's a number)
                    try:
                        level = int(parts[1].strip())
                        new_watchlist[move_name] = level
                    except ValueError:
                        print(f"Skipping line due to invalid level: {clean_line}")
                        continue
            
            self.watchlist = new_watchlist
            
            # --- THE TRUTH TEST ---
            # This prints the final list to your console so you can see if it's "clean"
            print("--- CURRENT WATCHLIST ---")
            for m, l in self.watchlist.items():
                print(f"DEBUG: Move=['{m}'] Level={l}")
            print("-------------------------")
            
            self.status_label.config(text=f"Moves Loaded: {len(self.watchlist)}", fg="#00FF00")
            
        except Exception as e:
            print(f"Load Error: {e}")
            self.status_label.config(text="LOAD ERROR", fg="red")

    def update_timer(self):
        """Self-looping timer that only runs while in_combat is True"""
        if self.in_combat and self.start_time:
            elapsed = int(time.time() - self.start_time)
            mins, secs = divmod(elapsed, 60)
            self.timer_label.config(text=f"BATTLE TIME: {mins:02d}:{secs:02d}")
            # Schedule the next update in 1000ms (1 second)
            self.root.after(1000, self.update_timer)
        else:
            # If we aren't in combat, stop the loop
            self.timer_label.config(text="00:00", fg="#666666")

    def trigger_alert(self, move, level):
        """Displays the alert and schedules a return to the combat UI"""
        # Cancel any pending 'back to engaged' resets to prevent overlapping
        if hasattr(self, '_reset_job'):
            self.root.after_cancel(self._reset_job)

        if level == 2:
            self.label.config(text=f"!!! {move.upper()} !!!", fg="black", bg="red")
            if os.path.exists(MP3_FILE):
                Thread(target=lambda: playsound(MP3_FILE), daemon=True).start()
            winsound.Beep(1200, 600)
        else:
            self.label.config(text=f"WATCH: {move}", fg="black", bg="yellow")
        
        # Force a return to the Green "ENGAGED" screen after 4 seconds
        # We store this in _reset_job so we can manage it if another move happens
        self._reset_job = self.root.after(4000, self.force_reset_ui)

    def force_reset_ui(self):
        """Safety function to ensure UI goes back to Green if we are still fighting"""
        if self.in_combat:
            self.label.config(text="ENGAGED", fg="#00FF00", bg="#002200")
        else:
            self.set_combat_state(False)

    def set_combat_state(self, active):
        if active:
            self.in_combat = True
            if self.start_time is None:
                self.start_time = time.time()
                print(f"[{time.strftime('%H:%M:%S')}] COMBAT STARTED")
                self.update_timer()
            
            if self.label.cget("bg") not in ["red", "yellow"]:
                self.label.config(text="ENGAGED", fg="#00FF00", bg="#002200")
                self.timer_label.config(fg="#00FF00")
        else:
            # Check if we were actually in combat before logging the stop
            if self.in_combat:
                end_time = time.time()
                duration = int(end_time - self.start_time) if self.start_time else 0
                mins, secs = divmod(duration, 60)
                
                # --- THIS IS THE NEW LOGGING LINE ---
                print(f"[{time.strftime('%H:%M:%S')}] COMBAT STOPPED (Duration: {mins:02d}:{secs:02d})")
            
            # Reset everything
            self.in_combat = False
            self.start_time = None
            if hasattr(self, '_reset_job'):
                try: self.root.after_cancel(self._reset_job)
                except: pass
            
            self.label.config(text="IDLE / READY", fg="white", bg="black")
            self.timer_label.config(text="00:00", fg="#666666")

    def run_monitor(self):
        current_log = None
        f = None
        # Initialize with a time in the past so it doesn't immediately timeout
        last_action_time = time.time() 

        while True:
            list_of_files = glob.glob(LOG_FOLDER_PATTERN)
            if not list_of_files:
                time.sleep(2)
                continue

            latest_log = max(list_of_files, key=os.path.getmtime)

            if latest_log != current_log:
                if f: f.close()
                current_log = latest_log
                f = open(current_log, "r", encoding="utf-8", errors="ignore")
                f.seek(0, os.SEEK_END)
                print(f"--- MONITORING: {current_log} ---")
                self.root.after(0, lambda: self.set_combat_state(False))

            line = f.readline()
            
            # --- TIMEOUT LOGIC ---
            if not line:
                if self.in_combat:
                    # If 60 seconds pass with NO new lines in the log, go Idle
                    if time.time() - last_action_time > 20:
                        print("DEBUG: Combat Timeout")
                        self.root.after(0, lambda: self.set_combat_state(False))
                time.sleep(0.1)
                continue

            # Clean the line
            line_lower = line.lower()
            clean_line = "".join(char for char in line_lower if char.isprintable())
            
            # Combat Activity Indicators
            # We removed 'effect' and 'takes' to make it less likely to get stuck 
            # on passive Regen or weather effects.
            activity_words = ["hits", "misses", "readies", "casts", "uses", "presents", "recovers", "gains", "points", "starts"]
            
            if any(word in clean_line for word in activity_words):
                last_action_time = time.time() # REFRESH the timer
                if not self.in_combat:
                    print("DEBUG: Combat Detected")
                    self.root.after(0, lambda: self.set_combat_state(True))

            # Watchlist Check
            for move, level in self.watchlist.items():
                if move.lower() in clean_line:
                    print(f"!!! MATCH FOUND: {move} !!!")
                    last_action_time = time.time()
                    self.root.after(0, lambda m=move, l=level: self.trigger_alert(m, l))

if __name__ == "__main__":
    root = tk.Tk()
    app = BattleMonitor(root)
    root.mainloop()