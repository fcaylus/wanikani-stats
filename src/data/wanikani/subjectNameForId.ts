import {readWaniKaniFile} from "./wanikani";

const subjects = readWaniKaniFile("subjects_id_name");

export default (id: number): string => {
    return subjects[id.toString()];
};
