import downloadFile from "./downloadFile";
import {ItemsHashMap} from "../interfaces/item";
import * as fs from "fs";
import cheerio from "cheerio";

interface DumpSource {
    source: string,
    url: string,
    categoryFromHeader: (header: string) => string;
}

const dumpSources: DumpSource[] = [
    {
        source: "jlpt",
        url: "http://wkw.natural20design.com/order.php?order=jlpt-ordered-by-heisig",
        categoryFromHeader: (header: string) => {
            return header.replace("JLPT N", "").replace(":", "").trim();
        }
    },
    {
        source: "kanken",
        url: "http://wkw.natural20design.com/order.php?order=kanken-ordered-by-heisig",
        categoryFromHeader: (header: string) => {
            return header.replace("Kanken Level ", "").replace(":", "").trim()
        }
    },
    {
        source: "joyo",
        url: "http://wkw.natural20design.com/order.php?order=jouyou-ordered-by-heisig",
        categoryFromHeader: (header: string) => {
            if (header.includes("Secondary")) {
                return "7";
            }
            return header.replace(" Grade:", "")
                .replace("st", "")
                .replace("nd", "")
                .replace("rd", "")
                .replace("th", "").trim();
        }
    }
];

export default async () => {
    for (const dumpSource of dumpSources) {
        console.log("-> Dumping \"" + dumpSource.source + "\" ...");

        const destFile = "src/data/sources/" + dumpSource.source + "/kanji_list.json";
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
            if (line.startsWith("Source") || line.startsWith("#")) {
                continue;
            }

            if (line.includes(":")) {
                currentCategory = dumpSource.categoryFromHeader(line);
                currentPosition = 0;
            } else {
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

        fs.writeFileSync(destFile, JSON.stringify(items, null, 2));
        console.log("--> \"" + dumpSource.source + "\" dumped !")
    }
}
