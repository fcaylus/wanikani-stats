/**
 * Simply compares 2 possibly null numbers
 */
export default (a: number | null | undefined, b: number | null | undefined): number => {
    return a ? (b ? a - b : a) : (b ? b : 0);
}
