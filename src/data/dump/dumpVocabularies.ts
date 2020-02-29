import downloadFile from "./downloadFile";
import {ItemsHashMap} from "../interfaces/item";
import * as fs from "fs";
import cheerio from "cheerio";

const categoryDumpSources = [
    {
        type: "tanos",
        category: "5",
        url: "http://www.tanos.co.uk/jlpt/jlpt5/vocab/"
    },
    {
        type: "tanos",
        category: "4",
        url: "http://www.tanos.co.uk/jlpt/jlpt4/vocab/"
    },
    {
        type: "tanos",
        category: "3",
        url: "http://www.tanos.co.uk/jlpt/jlpt3/vocab/"
    },
    {
        type: "tanos",
        category: "2",
        url: "http://www.tanos.co.uk/jlpt/jlpt2/vocab/"
    },
    {
        type: "tanos",
        category: "1",
        url: "http://www.tanos.co.uk/jlpt/jlpt1/vocab/"
    },
    {
        type: "wiki",
        category: "5",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N5"
    },
    {
        type: "wiki",
        category: "4",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N4"
    },
    {
        type: "wiki",
        category: "3",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N3"
    },
    {
        type: "wiki",
        category: "2",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N2"
    },
    {
        type: "wiki",
        category: "1",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N1/%E3%81%82%E8%A1%8C"
    },
    {
        type: "wiki",
        category: "1",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N1/%E3%81%8B%E8%A1%8C"
    },
    {
        type: "wiki",
        category: "1",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N1/%E3%81%95%E8%A1%8C"
    },
    {
        type: "wiki",
        category: "1",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N1/%E3%81%9F%E8%A1%8C"
    },
    {
        type: "wiki",
        category: "1",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N1/%E3%81%AA%E8%A1%8C"
    },
    {
        type: "wiki",
        category: "1",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N1/%E3%81%AF%E8%A1%8C"
    },
    {
        type: "wiki",
        category: "1",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N1/%E3%81%BE%E8%A1%8C"
    },
    {
        type: "wiki",
        category: "1",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N1/%E3%82%84%E8%A1%8C"
    },
    {
        type: "wiki",
        category: "1",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N1/%E3%82%89%E8%A1%8C"
    },
    {
        type: "wiki",
        category: "1",
        url: "https://en.wiktionary.org/wiki/Appendix:JLPT/N1/%E3%82%8F%E8%A1%8C"
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

        // Parse the data depending on the website type. This is used to merge 2 different website sources since there is
        // no official list
        if (source.type == "tanos") {
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
        } else if (source.type == "wiki") {
            $("div.mw-parser-output ol li, div.mw-parser-output ul li").each((_index, element) => {
                words.push($("span:first-child a", element).text().trim());
            });
        }

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

            if (!items[word]) {
                items[word] = {
                    name: word,
                    category: source.category,
                    position: currentPosition
                }
            }
        }

        console.log("---> dumped !")
    }

    const destFile = "src/data/sources/jlpt/vocabulary_list.json";
    fs.writeFileSync(destFile, JSON.stringify(items, null, 2));

    console.log("--> JLPT dumped !")
}
