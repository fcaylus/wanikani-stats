import WaniKaniApi from "../../server/WaniKaniApi";
import {Item} from "../interfaces/item";

/**
 * Parse WK subject pages (all page available for a specific type) by calling parseFunction() on each page.
 * Used to download WK data at first connection of the first user.
 */
export default async (apiKey: string, parseFunction: (data: any[]) => Item[], type: string): Promise<Item[] | null> => {
    // Retrieve all pages as long as there are available
    let newDataAvailable = true;
    let nextUrl = null;
    let dataList: Item[] = [];

    const api = WaniKaniApi(apiKey);

    while (newDataAvailable) {
        let result;
        // Only for the first loop
        if (!nextUrl) {
            result = await api.get("subjects", {
                types: type,
                hidden: false
            });
        } else {
            result = await api.get("", null, {
                baseURL: nextUrl
            });
        }

        if (result.error) {
            return null;
        }

        // Parse the data
        if (result.data && result.data.data) {
            nextUrl = result.data.pages.next_url;
            dataList.push(...parseFunction(result.data.data));
        }

        // Check if there is a new page after
        if (!result.data.pages || !result.data.pages.next_url) {
            newDataAvailable = false;
        }

        if (nextUrl) {
            console.log("--> " + nextUrl);
        }
    }

    return dataList;
}
