import colors from "./colors";

/**
 * Return a hash map of colors for each specified value.
 */
export default (values: number[]): { [value: number]: /* color */ string } => {
    if (values.length == 0) {
        return {}
    }

    // First, sort the array
    const sorted = values.sort();

    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const dist = max - min;

    // Divide dist in sub distances
    const sections = [];
    const nbColors = colors.graph.length;
    for (let i = 0; i < nbColors; i++) {
        sections.push(min + (i + 1) * (dist / nbColors));
    }

    // For each item, find in which section it's in
    const result: { [value: number]: string } = {};
    for (const value of sorted) {
        for (const index in sections) {
            if (value <= sections[index]) {
                // Add the color
                result[value] = colors.graph[index];
                break;
            }
        }

        // Default color
        if (!result[value]) {
            result[value] = colors.graph[nbColors - 1];
        }
    }

    return result;
}
