import itemTypesJson from "../data/item_types.json";
import colors from "./colors";

export const displayNameForType = (itemType: string) => {
    const types = Object(itemTypesJson);
    return types[itemType] ? types[itemType].display_name : "";
};

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
