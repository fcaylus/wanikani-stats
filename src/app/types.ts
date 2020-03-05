import itemTypesJson from "../data/item_types.json";
import colors from "./colors";

/**
 * Display name for the specified type
 */
export const displayNameForType = (itemType: string) => {
    const types = Object(itemTypesJson);
    return types[itemType] ? types[itemType].display_name : "";
};

/**
 * WaniKani color for the specified type
 */
export const colorForType = (itemType: string) => {
    if (itemType == "radical") {
        return colors.radical;
    } else if (itemType == "kanji") {
        return colors.kanji;
    } else if (itemType == "vocabulary") {
        return colors.vocabulary;
    }
    return colors.unknown;
};
