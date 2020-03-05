import colors from "./colors";

/**
 * Find the color corresponding to an SRS level
 * Based on: https://docs.api.wanikani.com/20170710/?shell#spaced-repetition-system
 */
export const colorForSRS = (srs?: number): string => {
    if (!srs || srs <= 0 || srs > 9) {
        return colors.unknown;
    } else if (srs >= 1 && srs <= 4) {
        return colors.apprentice;
    } else if (srs == 5 || srs == 6) {
        return colors.guru;
    } else if (srs == 7) {
        return colors.master;
    } else if (srs == 8) {
        return colors.enlightened;
    } else {
        return colors.burned;
    }
};

/**
 * Return the display name corresponding to the specified srs level.
 */
export const nameForSRS = (srs?: number): string => {
    if (!srs || srs <= 0 || srs > 9) {
        return "";
    } else if (srs >= 1 && srs <= 4) {
        return "Apprentice";
    } else if (srs == 5 || srs == 6) {
        return "Guru";
    } else if (srs == 7) {
        return "Master";
    } else if (srs == 8) {
        return "Enlightened";
    } else {
        return "Burned";
    }
};

/**
 * Return the srs levels merged by groups (ie. Apprentice, Guru, Master, Enlightened, Burned)
 */
export const srsGroups = (): number[][] => {
    return [[1, 2, 3, 4], [5, 6], [7], [8], [9]];
};
