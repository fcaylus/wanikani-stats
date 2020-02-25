import colors from "./colors";

/**
 * Find the color corresponding to an SRS level
 * Based on: https://docs.api.wanikani.com/20170710/?shell#spaced-repetition-system
 */
export default (srs?: number): string => {
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
