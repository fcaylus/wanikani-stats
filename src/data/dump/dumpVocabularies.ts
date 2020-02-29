import downloadFile from "./downloadFile";
import {ItemsHashMap} from "../interfaces/item";
import * as fs from "fs";
import cheerio from "cheerio";

const categoryDumpSources = [
    {
        category: "5",
        url: "http://www.tanos.co.uk/jlpt/jlpt5/vocab/"
    },
    {
        category: "4",
        url: "http://www.tanos.co.uk/jlpt/jlpt4/vocab/"
    },
    {
        category: "3",
        url: "http://www.tanos.co.uk/jlpt/jlpt3/vocab/"
    },
    {
        category: "2",
        url: "http://www.tanos.co.uk/jlpt/jlpt2/vocab/"
    },
    {
        category: "1",
        url: "http://www.tanos.co.uk/jlpt/jlpt1/vocab/"
    }
];

export default async () => {
    const items: ItemsHashMap = {};

    console.log("-> Dumping JLPT");

    for (const source of categoryDumpSources) {
        console.log("--> Dumping JLPT (Category \"" + source.category + "\") ...");

        const rawHTMLData = await downloadFile(source.url);
        const $ = cheerio.load(rawHTMLData);

        const words: string[] = [];
        $("#contentright table:nth-of-type(2) tbody tr").each((index, element) => {
            // Skip header
            if (index == 0) {
                return;
            }

            if (element.children[0].children.length > 0) {
                words.push($(element.children[0].children[0]).text().trim())
            } else {
                // Default to the hiragana reading
                words.push($(element.children[1].children[0]).text().trim())
            }
        });

        let currentPosition = 0;
        for (let word of words) {
            if (!word) {
                continue;
            }

            word = word.trim();
            if (word == "") {
                continue;
            }

            currentPosition += 1;

            items[word] = {
                name: word,
                category: source.category,
                position: currentPosition
            }
        }

        console.log("---> dumped !")
    }

    const destFile = "src/data/sources/jlpt/vocabulary_list.json";
    fs.writeFileSync(destFile, JSON.stringify(items, null, 2));

    console.log("--> JLPT dumped !")
}
