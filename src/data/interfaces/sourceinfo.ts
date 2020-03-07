/**
 * Contains informations about a source (except for WaniKani).
 * Allow the UI to show the source url, and some warning about the source.
 */
export interface SourceInfo {
    websiteName: string;
    url: string;
    info?: string;
}
