/**
 * Interface used by paginated endpoints
 */
export interface Page {
    // Tells if there is a next page
    hasNextPage: boolean;
    // If hasNextPage is true, then this contains the next page url
    nextPageUrl?: string;
    // Total number of pages
    numberOfPages: number;
    // Data of the page
    data: any;
}

/**
 * Check if data is a page result
 */
export const isPage = (data: any) => {
    return data && data.hasNextPage !== undefined;
};
