import sourceTypesJson from "../data/source_types.json";
import compareNumbers from "../compareNumbers";
import {readWaniKaniFile} from "../data/wanikani/wanikani";
import {readJLPTFile} from "../data/jlpt/jlpt";
import {Item, ItemCategory} from "../data/interfaces/item";
import {sourceExistsForItemType} from "../data/data";

// Cache file reads in memory because it can take a lot of time to read them from file system
let itemsCache: { [name: string]: any } = {};

const sources = Object(sourceTypesJson);
const OTHER_CATEGORY = "99999";

const sortItems = (itemsList: Item[]) => {
    // TODO: sorting should depends on the source type
    // Sort by:
    // 1. category
    // 2. position
    // 3. subPosition
    // 4. name
    return itemsList.sort((a, b) => {
        if (a.category == b.category) {
            if (a.position == b.position) {
                if (a.subPosition == b.subPosition) {
                    return a.name.localeCompare(b.name);
                }
                return compareNumbers(a.subPosition, b.subPosition);
            }
            return compareNumbers(a.position, b.position);
        }
        return compareNumbers(a.category, b.category);
    });
};

const splitIntoCategories = (fileData: any[], source: string, itemType: string): ItemCategory[] => {
    // Create each category needed by the specified source
    // Use string as category identifier to prevent automatic ordering of Object.values() and add an "_" in front of
    // every category
    let categories: { [category: string]: ItemCategory } = {};

    for (let category of sources[source].categories) {
        categories["_" + category.toString()] = {
            items: [],
            itemsType: itemType,
            showUserProgress: true,
            headerText: sources[source].categories_name_format.toString().replace("%d", category.toString())
        };
    }

    // Add a category for items without any
    categories["_" + OTHER_CATEGORY] = {
        items: [],
        itemsType: itemType,
        showUserProgress: true,
        headerText: "Other items"
    };

    // Fill each category with items
    for (let item of fileData) {
        const categoryIndex = (item.category ? item.category : OTHER_CATEGORY).toString();
        let category = categories["_" + categoryIndex];
        if (category) {
            // Default SRS
            if (!item.srs) {
                item.srs = 0;
            }
            category.items.push(item);
            categories["_" + categoryIndex] = category;
        }
    }

    let data: ItemCategory[] = Object.values(categories);

    // Sort every category
    for (let index in data) {
        let itemsList = data[index];
        itemsList.items = sortItems(itemsList.items);
        data[index] = itemsList;
    }

    return data;
};

const mergeWithWKData = (fileData: any, wkFileData: Item[]) => {
    let data = wkFileData;

    for (const index in data) {
        let item = data[index];
        if (fileData[item.name]) {
            // Update category
            item.category = fileData[item.name]
        } else {
            // Remove category
            item.category = undefined;
        }
        data[index] = item;
    }
    return data;
};

/**
 * Return the items list for a specified source and type.
 * NOTE: WaniKani data must be downloaded before this call since no checks are performed.
 */
export const getItems = (source: string, type: string): ItemCategory[] | null => {
    // Bad source and/or item type
    if (!sourceExistsForItemType(source, type)) {
        return null;
    }

    // If in cache, return it
    const label = type + "/" + source;
    if (itemsCache[label]) {
        return itemsCache[label]
    }

    // Read the corresponding file depending on the source type and merge it with the WaniKani data
    let fileData;
    let wkFileData = readWaniKaniFile(type);
    if (source === "wanikani") {
        fileData = wkFileData;
    } else {
        if (source === "jlpt") {
            fileData = readJLPTFile(type);
        }

        if (!fileData) {
            return null;
        }

        // Merge with WK data
        fileData = mergeWithWKData(fileData, wkFileData);
    }

    // And split the file into categories based on source_types.json
    const data = splitIntoCategories(fileData, source, type);

    itemsCache[label] = data;
    return data;
};
