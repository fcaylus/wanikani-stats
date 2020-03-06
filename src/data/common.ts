/**
 * List of fast levels
 */
import colors from "../app/colors";

export const FAST_LEVELS = [26, 41, 43, 44, 46, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];

/**
 * Fastest duration for fast levels (in hours)
 */
export const FAST_LEVEL_DURATION = 3 * 24 + 10;

/**
 * Fastest duration for normal levels (in hours)
 */
export const NORMAL_LEVEL_DURATION = FAST_LEVEL_DURATION * 2;

/**
 * Compute the fastest time needed to reach the specified level. Takes into account fast levels.
 */
export const fastestTimeToLevel = (level: number) => {
    const nbFastLevels = FAST_LEVELS.reduce((sum, fastLevel) => sum + (fastLevel < level ? 1 : 0), 0);

    return nbFastLevels * FAST_LEVEL_DURATION + (level - nbFastLevels - 1) * NORMAL_LEVEL_DURATION;
};

/**
 * Compute the fastest level duration
 */
export const fastestLevelDuration = (level: number) => {
    return FAST_LEVELS.includes(level) ? FAST_LEVEL_DURATION : NORMAL_LEVEL_DURATION;
};

/**
 * Durations of each SRS stages (in hours)
 * See: https://docs.api.wanikani.com/#spaced-repetition-system
 */
export const SRS_STAGES_DURATIONS = [4, 8, 23, 47, 167, 335, 719, 2879];

/**
 * List of levels with something "special". Used for the projection chart
 */
export const LEVELS_OF_INTEREST = [
    {
        level: 1,
        label: "Start"
    },
    {
        level: 3,
        label: "Last free level"
    },
    {
        level: 10,
        label: "JLPT N5 95%"
    },
    {
        level: 16,
        label: "JLPT N4 95%"
    },
    {
        level: 28,
        label: "Top 500 95%"
    },
    {
        level: 30,
        label: "Half the way !"
    },
    {
        level: 35,
        label: "JLPT N3 95%"
    },
    {
        level: 41,
        label: "Top 1000 95%"
    },
    {
        level: 48,
        label: "JLPT N2 95%"
    },
    {
        level: 56,
        label: "Top 1500 95%"
    },
    {
        level: 60,
        label: "Last level !"
    }
];

/**
 * Checks if the specified level is of interest
 * @param level
 */
export const isLevelOfInterest = (level: number) => {
    return LEVELS_OF_INTEREST.some(value => value.level == level);
};

/**
 * List of WK levels categories
 */
export const LEVEL_CATEGORIES = [
    {
        kanji: "快",
        name: "pleasant",
        color: colors.pleasant
    },
    {
        kanji: "苦",
        name: "painful",
        color: colors.painful
    },
    {
        kanji: "死",
        name: "death",
        color: colors.death
    },
    {
        kanji: "地獄",
        name: "hell",
        color: colors.hell
    },
    {
        kanji: "天国",
        name: "paradise",
        color: colors.paradise
    },
    {
        kanji: "現実",
        name: "reality",
        color: colors.reality
    }
];
