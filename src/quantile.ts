/**
 * Compute the quantile value for the specified percentage.
 */
export default (array: number[], percentile: number, alreadySorted?: boolean) => {
    if (!alreadySorted) {
        array.sort();
    }

    const index = percentile * (array.length - 1);
    if (Math.floor(index) == index) {
        return array[index];
    } else {
        const i = Math.floor(index);
        return array[i] + (array[i + 1] - array[i]) * (index - i);
    }
}
