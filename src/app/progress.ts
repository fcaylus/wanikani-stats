import {RootState} from "./redux/reducer";
import {ProgressHashMap, ProgressItemsCount} from "../data/interfaces/progress";
import {itemTypes} from "../data/data";
import {isResultSuccessful, progressSelector} from "./redux/api/selectors";

/**
 * Get the count of items for each type and SRS level. Need /api/progress results to compute them.
 * @param state
 */
export const getItemsCount = (state: RootState): ProgressItemsCount => {
    let counts: ProgressItemsCount = {
        srs: {},
        type: {}
    };

    // For each progress, the corresponding srs count is increased
    for (const type of itemTypes()) {
        const progressForType = progressSelector(state, type);
        if (isResultSuccessful(progressForType)) {
            counts.type[type] = Object.keys(progressForType.data).length;
            const srsList = Object.values(progressForType.data as ProgressHashMap);
            for (const srs of srsList) {
                counts.srs[srs] = (counts.srs[srs] ? counts.srs[srs] : 0) + 1;
            }
        }
    }

    return counts;
};
