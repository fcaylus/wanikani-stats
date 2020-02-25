import kanjiJson from "./kanji_list.json";

/**
 * Read kanji_list.json and return a hash map of "kanji name"/"category"
 */
export const readJLPTFile = (itemType: string): { [name: string]: /*category*/ number } | null => {
    if (itemType !== "kanji") {
        return null;
    }

    const jsonData = kanjiJson;

    // Create a hash map of name/category
    let items: { [name: string]: number } = {};
    for (const category of jsonData) {
        const rawItems = category.items.split("");
        for (const character of rawItems) {
            items[character] = category.category;
        }
    }

    return items;
};
