import parseWaniKaniApiPages from "./parseWaniKaniSubjectPages";
import {Item} from "../interfaces/item";

/**
 * Return the list of available kanjis on WaniKani.
 * Since this isn't paginated, this can take a while.
 */
export default async (apiKey: string): Promise<Item[] | null> => {
    const result = await parseWaniKaniApiPages(apiKey, (data: any[]): Item[] => {
        // Parse the kanji data
        let list = [];
        for (let kanji of data) {
            if (kanji) {
                list.push({
                    name: kanji.data.slug,
                    characters: kanji.data.characters,
                    category: kanji.data.level,
                    position: kanji.data.lesson_position,
                    subPosition: kanji.id,
                    url: kanji.data.document_url,
                    srs: 0
                })
            }
        }
        return list;
    }, "kanji");

    if (!result) {
        console.error("Could not download kanjis");
    }

    return result;
}
