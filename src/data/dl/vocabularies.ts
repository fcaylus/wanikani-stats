import parseWaniKaniApiPages from "./parseWaniKaniSubjectPages";
import {Item} from "../interfaces/item";

/**
 * Return the list of available vocabularies on WaniKani.
 * Since this isn't paginated, this can take a while.
 */
export default async (apiKey: string): Promise<Item[] | null> => {
    const result = await parseWaniKaniApiPages(apiKey, (data: any[]): Item[] => {
        // Parse the vocabulary data
        let list = [];
        for (let voc of data) {
            if (voc) {
                list.push({
                    name: voc.data.slug,
                    characters: voc.data.characters,
                    category: voc.data.level.toString(),
                    position: voc.data.lesson_position,
                    subPosition: voc.id,
                    url: voc.data.document_url,
                    srs: 0
                })
            }
        }
        return list;
    }, "vocabulary");

    if (!result) {
        console.error("Could not download vocabularies");
    }

    return result;
}
