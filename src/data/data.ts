import itemTypesJson from "./item_types.json";

const itemTypesList = Object(itemTypesJson);
const itemTypesKeys = Object.keys(itemTypesJson);

/**
 * Checks if the specified item type is valid
 */
export const itemTypeExists = (type: string) => {
    return itemTypesKeys.includes(type);
};

/**
 * Return the list of available item types
 */
export const itemTypes = (): string[] => {
    return itemTypesKeys;
};

/**
 * Checks if the specified source is valid for the specified item type
 */
export const sourceExistsForItemType = (source: string, itemType: string) => {
    return itemTypeExists(itemType) && itemTypesList[itemType].sources.includes(source);
};

