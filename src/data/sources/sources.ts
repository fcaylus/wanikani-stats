import * as fs from "fs";
import {ItemsHashMap} from "../interfaces/item";
import {SourceInfo} from "../interfaces/sourceinfo";

export const readFile = (itemType: string, source: string): ItemsHashMap => {
    return JSON.parse(fs.readFileSync("src/data/sources/" + source + "/" + itemType + "_list.json").toString());
};

export const readInfoFile = (itemType: string, source: string): SourceInfo => {
    return JSON.parse(fs.readFileSync("src/data/sources/" + source + "/" + itemType + "_info.json").toString());
};
