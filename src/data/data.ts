import itemTypesJson from "./item_types.json";

const itemTypes = Object(itemTypesJson);
const itemTypesKeys = Object.keys(itemTypesJson);

export const itemTypeExists = (type: string) => {
    return itemTypesKeys.includes(type);
};

export const sourceExistsForItemType = (source: string, itemType: string) => {
    return itemTypeExists(itemType) && itemTypes[itemType].sources.includes(source);
};

