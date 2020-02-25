const uuidRegex = new RegExp('^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$');

/**
 * Check if the provided string is a valid UUID token
 */
export default (str?: string) => {
    if (str) {
        return uuidRegex.test(str);
    }
    return false;
}
