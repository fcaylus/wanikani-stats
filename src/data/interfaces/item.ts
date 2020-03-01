/**
 * Define a basic item (for radicals, kanjis, vocabulary) interface
 */
export interface Item {
    // Name of the item (used as a unique identifier)
    name: string;
    // Characters used to display it (if exists)
    characters?: string;
    // Readings
    readings?: string[];
    // SRS level
    srs?: number;
    // Category (can be level, difficulty ... It depends on the source)
    category?: string;
    // Image used to display it (if there are no characters)
    image?: string;
    // Corresponding url
    url?: string;
    // Mainly used for sorting purposes if specified
    position?: number;
    subPosition?: number; // (set to WK id if the source is WK, because WK use the ID to sort some items)
}

/**
 * A category of items, ready to be displayed
 */
export interface ItemCategory {
    items: Item[];
    itemsType: string;
    category: string;
    showUserProgress?: boolean
    headerText?: string;
}

/**
 * Hash map of items. Used by sources other than WaniKani to easily merged them
 */
export interface ItemsHashMap {
    [name: string]: Item
}
