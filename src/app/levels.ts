import {Level} from "../data/interfaces/level";
import moment from "moment";

/**
 * Compute the duration (in ms) of the specified level. If not yet passed, compute the duration until now.
 * @param level
 */
export const durationOfLevel = (level: Level): number => {
    if (!level.unlockDate) {
        return 0;
    }

    return moment(level.passDate ? level.passDate : moment()).diff(level.startDate);
};

/**
 * Compute the average duration of levels (in ms). Exclude the current "unfinished" level, which is assumed to be the last
 */
export const averageLevelDuration = (levels: Level[]) => {
    if (levels.length == 0) {
        return 0;
    }
    return levels
        .map((level, index) => {
            return index == levels.length - 1 ? 0 : durationOfLevel(level);
        })
        .reduce((sum, duration) => sum + duration, 0) / (levels.length - 1);
};


