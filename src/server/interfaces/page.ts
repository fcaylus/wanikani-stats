/**
 * Interface used by paginated endpoints
 */
export interface Page {
    hasNextPage: boolean;
    nextPageUrl?: string;
    data: any;
}

/**
 * Check if data is a page result
 */
export const isPage = (data: any) => {
    return data && data.hasNextPage !== undefined;
};
