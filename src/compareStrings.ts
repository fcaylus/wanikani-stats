/**
 * Simply compares 2 possibly null strings
 */
export default (a: string | null | undefined, b: string | null | undefined): number => {
    return a ? (b ? a.localeCompare(b) : -1) : (b ? 1 : 0);
}
