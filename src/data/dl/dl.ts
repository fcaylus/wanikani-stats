import * as fs from "fs";
import radicals from "./radicals";
import kanjis from "./kanjis";
import vocabularies from "./vocabularies";
import rimraf from "rimraf";
import {Item} from "../interfaces/item";

export const TEMP_WK_DIRECTORY = ".temp";

export const ALLOWED_DOWNLOAD_TYPES = ["radical", "kanji", "vocabulary", "subjects_id_name"];

export const fileNameForType = (type: string): string => {
    return TEMP_WK_DIRECTORY + "/" + type + "_list.json";
};

export const isDownloaded = (type: string): boolean => {
    return fs.existsSync(fileNameForType(type));
};

/**
 * Download all WaniKani subjects and save them to a temp directory.
 * If the directory already exists, redownload everything.
 * @param apiKey
 */
export const downloadAllSubjects = async (apiKey: string) => {
    console.log("Downloading WK subjects ...");

    // Remove previous directory
    if (fs.existsSync(TEMP_WK_DIRECTORY)) {
        rimraf.sync(TEMP_WK_DIRECTORY);
    }
    if (!fs.existsSync(TEMP_WK_DIRECTORY)) {
        fs.mkdirSync(TEMP_WK_DIRECTORY);
    }

    const types = [
        {
            name: "radical",
            func: radicals
        },
        {
            name: "kanji",
            func: kanjis
        },
        {
            name: "vocabulary",
            func: vocabularies
        }
    ];

    const promises = [];
    for (const type of types) {
        promises.push(type.func(apiKey))
    }

    let itemsList: Item[] = [];

    await Promise.all(promises).then((results) => {
        for (const index in types) {
            if (results[index] !== null) {
                // @ts-ignore
                itemsList.push(...results[index]);
                // Write to file
                fs.writeFileSync(fileNameForType(types[index].name), JSON.stringify(results[index]));
            }
        }
    });

    // Generate hash map of "subject id"/"subject name" for every kind of subjects.
    // This is useful for /api/progress, since WK identify items by IDs, not name
    let idsHash: { [id: number]: string } = {};

    for (let item of itemsList) {
        if (item.subPosition) {
            idsHash[item.subPosition] = item.name;
        }
    }

    fs.writeFileSync(fileNameForType("subjects_id_name"), JSON.stringify(idsHash));

    console.log("WaniKani subjects downloaded !");
};

/**
 * Download all subjects from WaniKani if required
 * @param apiKey
 */
export const downloadAllSubjectsIfNecessary = async (apiKey: string) => {
    for (const type of ALLOWED_DOWNLOAD_TYPES) {
        if (!isDownloaded(type)) {
            await downloadAllSubjects(apiKey);
            return;
        }
    }
};
