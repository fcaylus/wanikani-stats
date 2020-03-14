import parseWaniKaniApiPages from "./parseWaniKaniSubjectPages";
import {Item} from "../interfaces/item";

/**
 * Return the list of available radicals on WaniKani.
 * Since this isn't paginated, this can take a while.
 * See: https://docs.api.wanikani.com/#radical-attributes
 */
export default async (apiKey: string): Promise<Item[] | null> => {
    const result = await parseWaniKaniApiPages(apiKey, (data: any[]): Item[] => {
        // Search for the 64x64 image of the radical
        const findRadicalImageUrl = (radical: any) => {
            if (radical.data && radical.data.character_images) {
                for (let image of radical.data.character_images) {
                    // Get the SVG image
                    if (image.metadata && image.metadata.inline_styles) {
                        return image.url;
                    }
                }
            }
            return undefined;
        };

        // Parse the radical data
        let list: Item[] = [];
        for (let radical of data) {
            if (radical) {
                list.push({
                    name: radical.data.slug,
                    image: findRadicalImageUrl(radical),
                    characters: radical.data.characters ? radical.data.characters : undefined,
                    category: radical.data.level.toString(),
                    position: radical.data.lesson_position,
                    subPosition: radical.id,
                    url: radical.data.document_url,
                    srs: 0
                });
            }
        }
        return list;
    }, "radical");

    if (!result) {
        console.error("Could not download radicals");
    }

    return result;
}
