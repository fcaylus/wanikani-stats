import * as fs from "fs";
import {fileNameForType} from "../../dl/dl";

export const readWaniKaniFile = (itemType: string): any => {
    return JSON.parse(fs.readFileSync(fileNameForType(itemType)).toString());
};
