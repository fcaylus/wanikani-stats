import sourceTypesJson from "../data/source_types.json";
import compareNumbers from "../compareNumbers";
import {readWaniKaniFile} from "../data/sources/wanikani/wanikani";
import {Item, ItemCategory, ItemsHashMap} from "../data/interfaces/item";
import {sourceExistsForItemType} from "../data/data";
import compareStrings from "../compareStrings";
import {readFile} from "../data/sources/sources";

// Cache file reads in memory because it can take a lot of time to read them from file system
let itemsCache: { [name: string]: any } = {};

const sources = Object(sourceTypesJson);
const OTHER_CATEGORY = "99999";

const sortItems = (itemsList: Item[]) => {
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
        return compareStrings(a.category, b.category);
    });
};

const splitIntoCategories = (fileData: Item[], source: string, itemType: string): ItemCategory[] => {
    // Create each category needed by the specified source
    // add an "_" in front of every category to prevent automatic ordering of Object.values()
    let categories: { [category: string]: ItemCategory } = {};

    for (let category of sources[source].categories) {
        // Parse the category name/displayed name based on the typeof
        let categoryName;
        let displayedName;
        if (typeof category === "object") {
            categoryName = category.name;
            // Custom name for the category
            displayedName = category.displayed_name;
        } else {
            categoryName = category;
            // Default name format for the source
            displayedName = sources[source].categories_name_format.toString().replace("%s", category)
        }

        categories["_" + categoryName] = {
            items: [],
            itemsType: itemType,
            showUserProgress: true,
            headerText: displayedName
        };
    }

    // Add a category for items without any
    categories["_" + OTHER_CATEGORY] = {
        items: [],
        itemsType: itemType,
        showUserProgress: true,
        headerText: "Not listed"
    };

    // Fill each category with items
    for (let item of fileData) {
        const categoryIndex = (item.category ? item.category : OTHER_CATEGORY);
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

const jishoUrlForItem = (name: string, type: string) => {
    if (type == "kanji") {
        return "https://jisho.org/search/" + name + "%20%23kanji";
    }
    return "https://jisho.org/search/" + name;
};

const mergeWithWKData = (fileData: ItemsHashMap, wkFileData: Item[], itemType: string) => {
    let data = wkFileData;

    for (const index in data) {
        let item = data[index];

        // Check for missing item
        if (!fileData[item.name]) {
            // Remove category
            item.category = undefined;
        } else {
            // Update item
            item = {...item, ...fileData[item.name]};
            delete fileData[item.name];
        }

        // For vocabulary, check in the readings of wanikani also
        // If found, keep the WaniKani name and characters
        if (itemType == "vocabulary" && item.readings) {
            for (const reading of item.readings) {
                if (fileData[reading]) {
                    item = {
                        ...item,
                        ...fileData[reading],
                        name: item.name,
                        characters: item.characters
                    };
                    delete fileData[reading];
                    break;
                }
            }
        }

        data[index] = item;
    }

    // Add all items present in the data but not in WK (and set some defaults for them
    for (const item of Object.values(fileData)) {
        data.push({
            ...item,
            characters: item.name,
            url: jishoUrlForItem(item.name, itemType)
        });
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
    let fileData: ItemsHashMap | null = null;
    let wkFileData: Item[] = readWaniKaniFile(type);
    let mergedData: Item[];
    if (source === "wanikani") {
        mergedData = wkFileData;
    } else {
        fileData = readFile(type, source);

        // Merge with WK data
        mergedData = mergeWithWKData(fileData, wkFileData, type);
    }

    // And split the file into categories based on source_types.json
    const data = splitIntoCategories(mergedData, source, type);

    itemsCache[label] = data;
    return data;
};
