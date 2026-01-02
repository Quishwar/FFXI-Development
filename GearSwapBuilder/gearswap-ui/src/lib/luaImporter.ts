export interface EquippedItem {
  name: string;
  augments?: string[];
  rank?: number;
  path?: string;
}

export type GearSet = Record<string, string | EquippedItem>;
export type AllSets = Record<string, GearSet>;

export interface ImportLog {
  status: 'success' | 'warning' | 'error';
  message: string;
  path?: string;
}

export interface ParseResult {
  sets: AllSets;
  logs: ImportLog[];
}

export const parseLuaToSets = (luaText: string): ParseResult => {
  console.log("--- Parser Started ---");
  const sets: AllSets = {};
  const logs: ImportLog[] = [];
  
  const cleanLua = luaText.replace(/--.*$/gm, "");

  // Regex captures the path and allows colons for Tachi: Fudo
  const setFinder = /sets((?:[\.\[]['"]?[\w\d_ \-\+:]+['"]?\]?)+)\s*=\s*/g;
  
  let match;
  while ((match = setFinder.exec(cleanLua)) !== null) {
    let path = match[1].trim();
    if (path.startsWith('.')) path = path.substring(1);
    
    const startIndex = setFinder.lastIndex;
    const remainingText = cleanLua.substring(startIndex).trim();

    // CASE 1: set_combine(sets.path, {gear})
    if (remainingText.startsWith('set_combine')) {
      // 1. Extract the base set path from inside the parentheses
      // This looks for something like sets.precast.WS.Acc
      const baseSetMatch = remainingText.match(/set_combine\s*\(\s*sets((?:[\.\[]['"]?[\w\d_ \-\+:]+['"]?\]?)+)/);
      
      let baseGear: GearSet = {};
      if (baseSetMatch) {
        let baseSetPath = baseSetMatch[1].trim();
        if (baseSetPath.startsWith('.')) baseSetPath = baseSetPath.substring(1);
        
        // If we have already parsed the base set, grab its gear
        if (sets[baseSetPath]) {
          baseGear = JSON.parse(JSON.stringify(sets[baseSetPath]));
        }
      }

      // 2. Find the curly braces for the NEW gear
      let depth = 0;
      let endIndex = -1;
      const absoluteStart = cleanLua.indexOf('{', startIndex);
      
      if (absoluteStart !== -1) {
        for (let i = absoluteStart; i < cleanLua.length; i++) {
          if (cleanLua[i] === '{') depth++;
          else if (cleanLua[i] === '}') depth--;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }

        if (endIndex !== -1) {
          const setBlock = cleanLua.substring(absoluteStart + 1, endIndex);
          const newGear = parseGearBlock(setBlock);
          
          // 3. MERGE: Spread baseGear first, then newGear to overwrite slots
          sets[path] = { ...baseGear, ...newGear };
          logs.push({ status: 'success', message: `Combined ${path} with base gear`, path });
        }
      }
    } 
    // CASE 2: Standard Table Definition { ... }
    else if (remainingText.startsWith('{')) {
      let depth = 0;
      let endIndex = -1;
      const absoluteStart = cleanLua.indexOf('{', startIndex);
      
      for (let i = absoluteStart; i < cleanLua.length; i++) {
        if (cleanLua[i] === '{') depth++;
        else if (cleanLua[i] === '}') depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }

      if (endIndex !== -1) {
        const setBlock = cleanLua.substring(absoluteStart + 1, endIndex);
        sets[path] = parseGearBlock(setBlock);
      }
    }
    // CASE 3: Simple Pointer (A = B)
    else if (remainingText.startsWith('sets')) {
      const pointerMatch = remainingText.match(/^sets((?:[\.\[]['"]?[\w\d_ \-\+:]+['"]?\]?)+)/);
      if (pointerMatch) {
        let sourcePath = pointerMatch[1].trim();
        if (sourcePath.startsWith('.')) sourcePath = sourcePath.substring(1);
        if (sets[sourcePath]) {
          sets[path] = JSON.parse(JSON.stringify(sets[sourcePath]));
        }
      }
    }
  }

  return { sets, logs };
};

function parseGearBlock(block: string): GearSet {
  const gear: GearSet = {};
  const slotMap: Record<string, string> = {
    left_ear: "ear1", right_ear: "ear2",
    left_ring: "ring1", right_ring: "ring2"
  };

  /**
   * 1. TABLE PARSING (slot={...})
   * Uses backreferences \2 to ensure name="Mpaca's Cap" captures the whole string
   */
  const tableRegex = /([\w\d_]+)\s*=\s*\{([^{}]*?\{[^{}]*?\}[^{}]*?|[^{}]*?)\}/g;
  
  let match;
  while ((match = tableRegex.exec(block)) !== null) {
    const rawSlot = match[1].toLowerCase();
    if (['name', 'augments', 'path', 'rank'].includes(rawSlot)) continue;

    const slot = slotMap[rawSlot] || rawSlot;
    const content = match[2];

    // Refined name match: matches starting quote and only stops at the same ending quote
    const nameMatch = content.match(/name\s*=\s*(["'])(.*?)\1/);
    if (nameMatch) {
      const item: EquippedItem = { name: nameMatch[2].trim() };

      if (content.includes("augments")) {
        const augStart = content.indexOf('{', content.indexOf('augments'));
        const augEnd = content.indexOf('}', augStart);
        if (augStart !== -1 && augEnd !== -1) {
          item.augments = content.substring(augStart + 1, augEnd)
            .split(',')
            .map(a => a.replace(/['"\r\n\t]/g, '').trim())
            .filter(a => a !== "");
        }
      }
      
      // Path and Rank matches
      const pathMatch = content.match(/path\s*=\s*(["'])(.*?)\1/);
      if (pathMatch) item.path = pathMatch[2];

      const rankMatch = content.match(/rank\s*=\s*(\d+)/);
      if (rankMatch) item.rank = parseInt(rankMatch[1]);

      gear[slot] = item;
    }
  }

  /**
   * 2. STRING PARSING (slot="Item Name")
   * Updated to handle apostrophes correctly
   */
  const stringRegex = /([\w\d_]+)\s*=\s*(["'])(.*?)\2/g;
  while ((match = stringRegex.exec(block)) !== null) {
    const slot = slotMap[match[1].toLowerCase()] || match[1].toLowerCase();
    // Don't overwrite if we already found a table version of this slot
    if (!gear[slot] && !['name', 'path', 'augments'].includes(slot)) {
      gear[slot] = match[3].trim();
    }
  }

  return gear;
}