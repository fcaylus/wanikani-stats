import itemTypesJson from "./item_types.json";

const itemTypesList = Object(itemTypesJson);
const itemTypesKeys = Object.keys(itemTypesJson);

export const itemTypeExists = (type: string) => {
    return itemTypesKeys.includes(type);
};

export const itemTypes = (): string[] => {
    return itemTypesKeys;
};

export const sourceExistsForItemType = (source: string, itemType: string) => {
    return itemTypeExists(itemType) && itemTypesList[itemType].sources.includes(source);
};

