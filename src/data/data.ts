import itemTypesJson from "./item_types.json";

export const itemTypeExists = (type: string) => {
    return Object.keys(itemTypesJson).includes(type);
};

export const sourceExistsForItemType = (source: string, itemType: string) => {
    return itemTypeExists(itemType) && Object(itemTypesJson)[itemType].sources.includes(source);
};

