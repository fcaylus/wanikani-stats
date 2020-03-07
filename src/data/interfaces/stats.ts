import {ItemCategory} from "./item";
import {SourceInfo} from "./sourceinfo";

/**
 * Statistics for a specified level. This is basically a list of percentages for each category.
 */
export interface LevelStats {
    level: string;
    categories: {
        [category: string]: /* percentage */ number;
    }
}

/**
 * Stats table for a specified source (percentages are computed against WaniKani levels)
 */
export interface Stats {
    source: string;
    sourceInfo: SourceInfo;
    categories: string[];
    displayedCategories: string[];
    levels: LevelStats[],
    otherItems: ItemCategory[];
}
