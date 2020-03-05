/**
 * Accuracy interface containing counts of correct/incorrect answers.
 */
export interface Accuracy {
    // "radical", "kanji" or "vocabulary"
    [itemType: string]: {
        // "correct", "incorrect", "total"
        [accuracyCategory: string]: {
            // "reading", "meaning"
            [accuracyType: string]: number
        }
    }
}
