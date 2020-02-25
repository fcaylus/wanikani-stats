/**
 * Interface used by paginated endpoints
 */
export interface PaginatedEndpointResult {
    hasNextPage: boolean;
    nextPageUrl?: string;
    data: any;
}
