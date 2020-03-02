/**
 * Interface used by paginated endpoints
 */
export interface Page {
    hasNextPage: boolean;
    nextPageUrl?: string;
    data: any;
}
