import {PaginatedEndpointResult} from "./paginated";

/**
 * Interfaces used by the endpoint /api/progress
 */

export interface ProgressHashMap {
    [subjectName: string]: /* SRS level */ number;
}

export interface ProgressEndpointResult extends PaginatedEndpointResult {
    data: ProgressHashMap;
}
