import {ApiRequest} from "./types";

export const labelForApiRequest = (request: ApiRequest): string => {
    return JSON.stringify(request);
};
