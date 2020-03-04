import colors from "./colors";
import quantile from "../quantile";

export interface GraphColorsHashMap {
    [value: number]: /* color */ string
}

/**
 * Return a hash map of colors for each specified value.
 */
export default (values: number[]): GraphColorsHashMap => {
    if (values.length == 0) {
        return {}
    }

    // First, sort the array
    const sorted = values.sort();

    // Divide dist in sub distances with the same number of elements each (ie. quantiles)
    const sections = [];
    const nbColors = colors.graph.length;
    for (let i = 0; i < nbColors; i++) {
        sections.push(quantile(sorted, (i + 1) / nbColors))
    }

    // For each item, find in which section it's in
    const result: GraphColorsHashMap = {};
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
