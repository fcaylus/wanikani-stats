/**
 * Represents a WaniKani level and the different dates associated with
 */
export interface Level {
    level: number;
    // When the level was accessible
    unlockDate?: Date;
    // When the first lesson of the level was done
    startDate?: Date;
    // When 90% of the kanji were Guru+ for the first time
    passDate?: Date;
    // When all items are burned
    completionDate?: Date;
}

/**
 * Hash map of WaniKani levels
 */
export interface LevelsHashMap {
    [level: number]: Level
}
