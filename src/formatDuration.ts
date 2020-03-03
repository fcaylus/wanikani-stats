import humanizeDuration from "humanize-duration";

/**
 * Format a duration (in ms)
 */
export default (duration: number) => {
    if (duration == 0) {
        return " - ";
    }
    return humanizeDuration(duration, {
        units: ["y", "mo", "d", "h"],
        round: true
    });
};
