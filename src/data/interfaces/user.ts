/**
 * User interface
 */
export interface User {
    token: string;
    username: string;
    // Either 3 or 60
    maxLevel: number;
    currentLevel: number;
    profileUrl: string;
}
