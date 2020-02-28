import * as fs from "fs";
import {ItemsHashMap} from "../interfaces/item";

export const readFile = (itemType: string, source: string): ItemsHashMap => {
    return JSON.parse(fs.readFileSync("src/data/sources/" + source + "/" + itemType + "_list.json").toString());
};
