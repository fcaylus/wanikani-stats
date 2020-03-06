import WaniKaniApi from "./WaniKaniApi";
import {LevelsHashMap} from "../data/interfaces/level";
import {QueryParameter} from "./interfaces/query";

/**
 * Get list of levels progressions from WaniKani
 */
export const getLevels = async (token: string, updatedAfter?: QueryParameter): Promise<LevelsHashMap | null> => {
    // See: https://docs.api.wanikani.com/#get-all-level-progressions
    let wkResult = await WaniKaniApi(token).get("level_progressions", {
        updated_after: updatedAfter ? updatedAfter.toString() : undefined
    });

    if (wkResult.error || !wkResult.data) {
        return null;
    }

    let levels: LevelsHashMap = {};

    for (const wkLevel of wkResult.data.data) {
        // Skip the level if it has a "abandoned_at" field, which means it was reset
        if (wkLevel.data.abandoned_at) {
            continue;
        }

        const level = wkLevel.data.level;

        levels[level] = {
            level: level,
            unlockDate: wkLevel.data.unlocked_at,
            startDate: wkLevel.data.started_at,
            passDate: wkLevel.data.passed_at,
            completionDate: wkLevel.data.completed_at
        };
    }

    return levels;
};
