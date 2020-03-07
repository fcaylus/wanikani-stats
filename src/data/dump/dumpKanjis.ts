import downloadFile from "./downloadFile";
import {ItemsHashMap} from "../interfaces/item";
import * as fs from "fs";
import cheerio from "cheerio";
import {SourceInfo} from "../interfaces/sourceinfo";

interface DumpSource {
    source: string;
    url: string;
    website: string;
    info?: string;
    // If it returns undefined, the string wasn't found
    categoryFromHeader: (header: string) => string | undefined;
}

const dumpSources: DumpSource[] = [
    {
        source: "jlpt",
        url: "http://wkw.natural20design.com/order.php?order=jlpt-ordered-by-heisig",
        website: "Nihongo-pro",
        info: "There is no official list for JLPT kanjis.",
        categoryFromHeader: (header: string) => {
            return header.startsWith("#") ? undefined : header.replace("JLPT N", "").replace(":", "").trim();
        }
    },
    {
        source: "kanken",
        url: "http://wkw.natural20design.com/order.php?order=kanken-ordered-by-heisig",
        website: "Nihongo-pro",
        categoryFromHeader: (header: string) => {
            return header.startsWith("#") ? undefined : header.replace("Kanken Level ", "").replace(":", "").trim()
        }
    },
    {
        source: "joyo",
        url: "http://wkw.natural20design.com/order.php?order=jouyou-ordered-by-heisig",
        website: "Wikipedia",
        categoryFromHeader: (header: string) => {
            if (header.startsWith("#")) {
                return undefined;
            }
            if (header.includes("Secondary")) {
                return "7";
            }
            return header.replace(" Grade:", "")
                .replace("st", "")
                .replace("nd", "")
                .replace("rd", "")
                .replace("th", "").trim();
        }
    },
    {
        source: "frequency",
        url: "http://wkw.natural20design.com/order.php?order=frequency",
        website: "KanjiCards",
        categoryFromHeader: (header: string) => {
            return header.startsWith("#") && header.includes("-") ? header.split("-")[1].trim() : undefined;
        }
    }
];

export default async () => {
    for (const dumpSource of dumpSources) {
        console.log("-> Dumping \"" + dumpSource.source + "\" ...");

        const items: ItemsHashMap = {};

        const rawHTMLData = await downloadFile(dumpSource.url);
        const $ = cheerio.load(rawHTMLData);
        const content = $("pre").text();
        const lines = content.split("\n");

        let currentCategory = "";
        let currentPosition = 0;
        for (let line of lines) {
            line = line.trim();
            if (!line || line.length == 0) {
                continue;
            }
            if (line.startsWith("Source")) {
                continue;
            }

            if (line.includes(":") || line.startsWith("#")) {
                const category = dumpSource.categoryFromHeader(line);
                if (!category) {
                    continue;
                }
                currentCategory = category;
                currentPosition = 0;
            } else {
                // Remove all spaces from the line
                line = line.replace(/\s+/g, "");
                const characters = line.split("");
                for (const character of characters) {
                    currentPosition += 1;
                    items[character] = {
                        name: character,
                        category: currentCategory,
                        position: currentPosition
                    }
                }
            }
        }

        // Write list file
        const destFile = "src/data/sources/" + dumpSource.source + "/kanji_list.json";
        fs.writeFileSync(destFile, JSON.stringify(items, null, 2));

        // Write info file
        const info: SourceInfo = {
            url: dumpSource.url,
            websiteName: dumpSource.website,
            info: dumpSource.info
        };
        const infoDestFile = "src/data/sources/" + dumpSource.source + "/kanji_info.json";
        fs.writeFileSync(infoDestFile, JSON.stringify(info, null, 2));

        console.log("--> \"" + dumpSource.source + "\" dumped !")
    }
}
