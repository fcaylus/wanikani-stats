import {ItemCategory} from "./item";

export interface LevelStats {
    level: string;
    categories: {
        [category: string]: /* percentage */ number;
    }
}

export interface Stats {
    source: string;
    categories: string[];
    displayedCategories: string[];
    levels: LevelStats[],
    otherItems: ItemCategory[];
}
