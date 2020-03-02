import sourceTypesJson from "../data/source_types.json";
import compareNumbers from "../compareNumbers";
import {readWaniKaniFile} from "../data/sources/wanikani/wanikani";
import {Item, ItemCategory, ItemsHashMap} from "../data/interfaces/item";
import {sourceExistsForItemType} from "../data/data";
import compareStrings from "../compareStrings";
import {readFile} from "../data/sources/sources";
import {maxLevelAllowed} from "./users";
import {LevelStats, Stats} from "../data/interfaces/stats";

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

/**
 * Get the list of available categories for a source
 */
const categoriesForSource = (source: string) => {
    let categories = [];
    for (const category of sources[source].categories) {
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

        categories.push({
            name: categoryName,
            displayedName: displayedName
        });
    }

    return categories;
};


/**
 * Split the item list into categories
 */
const splitIntoCategories = (fileData: Item[], source: string, itemType: string): ItemCategory[] => {
    // Create each category needed by the specified source
    // add an "_" in front of every category to prevent automatic ordering of Object.values()
    let categories: { [category: string]: ItemCategory } = {};

    for (const category of categoriesForSource(source)) {
        categories["_" + category.name] = {
            items: [],
            itemsType: itemType,
            category: category.name,
            showUserProgress: true,
            headerText: category.displayedName
        };
    }

    // Add a category for items without any
    categories["_" + OTHER_CATEGORY] = {
        items: [],
        itemsType: itemType,
        category: OTHER_CATEGORY,
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

/**
 * Add default data (jisho url, ...)
 */
const addMinimalDefaultData = (item: Item, itemType: string) => {
    return {
        ...item,
        characters: item.name,
        url: jishoUrlForItem(item.name, itemType)
    };
};

/**
 * Merge fileData with the WaniKani data
 */
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
        data.push(addMinimalDefaultData(item, itemType));
    }

    return data;
};

// Only returns WaniKani data with level lower than the specified maximum
const filterWaniKaniData = (wkFileData: Item[], maxLevel: number): Item[] => {
    if (maxLevel == 60) {
        return wkFileData;
    }

    let data: Item[] = [];
    wkFileData.map((item) => {
        if (item.category && parseInt(item.category, 10) <= maxLevel) {
            data.push(item);
        }
    });
    return data;
};

/**
 * Return the items list for a specified source and type.
 * NOTE: WaniKani data must be downloaded before this call since no checks are performed.
 * apiKey is used to retrieve the user info and thus the level limit of the user
 */
export const getItems = async (source: string, type: string, apiKey: string, mergeWithWK = true): Promise<ItemCategory[] | null> => {
    // Bad source and/or item type
    if (!sourceExistsForItemType(source, type)) {
        return null;
    }

    const maxLevel: number = await maxLevelAllowed(apiKey);

    // If in cache, return it
    const label = type + "/" + source + "/" + maxLevel.toString() + (source != "wanikani" ? "/" + (mergeWithWK ? "merge" : "nomerge") : "");
    if (itemsCache[label]) {
        return itemsCache[label]
    }

    // Read the corresponding file depending on the source type and merge it (if required) with the WaniKani data
    let mergedData: Item[];

    if (!mergeWithWK) {
        if (source === "wanikani") {
            mergedData = filterWaniKaniData(readWaniKaniFile(type), maxLevel);
        } else {
            mergedData = Object.values(readFile(type, source));
        }
    } else {
        let wkFileData: Item[] = filterWaniKaniData(readWaniKaniFile(type), maxLevel);
        if (source === "wanikani") {
            mergedData = wkFileData;
        } else {
            // Merge with WK data
            mergedData = mergeWithWKData(readFile(type, source), wkFileData, type);
        }
    }

    // And split the file into categories based on source_types.json
    const data = splitIntoCategories(mergedData, source, type);

    itemsCache[label] = data;
    return data;
};

/**
 * Get the WaniKani items distribution stats related to the specified source.
 */
export const getStats = async (source: string, type: string, apiKey: string): Promise<Stats | null> => {
    // Bad source and/or item type
    if (!sourceExistsForItemType(source, type)) {
        return null;
    }

    // Can't get stats for wanikani AND wanikani, that doesn't make sense
    if (source === "wanikani") {
        return null;
    }

    let stats: Stats = {
        source: source,
        categories: [],
        displayedCategories: [],
        levels: [],
        otherItems: []
    };

    for (const category of categoriesForSource(source)) {
        stats.categories.push(category.name);
        stats.displayedCategories.push(category.displayedName);
    }

    // Get WaniKani data AND the specified source/type data
    let wkData: ItemCategory[] | null = await getItems("wanikani", type, apiKey, false);
    let otherData: ItemsHashMap = readFile(type, source);

    if (!wkData || !otherData) {
        return null;
    }

    // First, count the number of items in each category of other data
    const countItems = (itemsHashMap: ItemsHashMap) => {
        let count: { [category: string]: number } = {};

        for (const item of Object.values(itemsHashMap)) {
            if (item.category && item.category != OTHER_CATEGORY) {
                if (count[item.category]) {
                    count[item.category] = count[item.category] + 1;
                } else {
                    count[item.category] = 1;
                }
            }
        }
        return count;
    };
    const initialCount = countItems(otherData);

    // Then, for each level of wkData, remove the items in otherData. When removed, recount the number of items
    // to have the percentage of items.
    for (const wkCategory of wkData) {
        if (wkCategory.category == OTHER_CATEGORY) {
            continue;
        }

        let levelStats: LevelStats = {
            level: wkCategory.category,
            categories: {}
        };

        for (const item of wkCategory.items) {
            if (otherData[item.name]) {
                delete otherData[item.name];
            }
        }

        // Re-count the number of items
        const newCount = countItems(otherData);

        for (const otherCategory of Object.keys(initialCount)) {
            const newLength = newCount[otherCategory] ? newCount[otherCategory] : 0;

            levelStats.categories[otherCategory] = (initialCount[otherCategory] - newLength) / initialCount[otherCategory];
        }

        stats.levels.push(levelStats);
    }

    // Add "other items", not listed in WaniKani
    stats.otherItems = splitIntoCategories(Object.values(otherData).map((item) => addMinimalDefaultData(item, type)), source, type);

    return stats;
};
