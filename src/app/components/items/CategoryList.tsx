import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {List, ListItem} from "@material-ui/core";
import {ProgressHashMap} from "../../../data/interfaces/progress";
import {ItemCategory} from "../../../data/interfaces/item";
import ItemList from "./ItemList";

const useStyles = makeStyles(() => ({
    list: {
        display: "flex",
        flexDirection: "column"
    },
    categoryItem: {
        flexDirection: "column",
        alignItems: "unset",
        position: "unset",
        padding: 0
    }
}));

interface CategoryListItemProps {
    categoryProps: ItemCategory,
    progress?: ProgressHashMap
}

const CategoryListItem = React.memo((props: CategoryListItemProps) => {
    const classes = useStyles();
    return (
        <ListItem dense disableGutters className={classes.categoryItem}>
            <ItemList {...props.categoryProps} progress={props.progress}/>
        </ListItem>
    );
});

interface CategoryListProps {
    categories?: ItemCategory[];
    progress?: ProgressHashMap;
    initialDataLength?: number
}

/**
 * List of items categories. Each category is displayed one by one to avoid large freeze of the rendering.
 * See displayItemListProgressively() inner function for an explanation.
 */
const CategoryList = (props: CategoryListProps) => {
    const classes = useStyles();

    // displayedDataLength increase progressively to improve the "Time to Content" of the page
    const [displayedDataLength, setDisplayedDataLength] = useState(props.initialDataLength ? props.initialDataLength : 0);
    // Allow to properly stop the progressive rendering when changing page
    const [displayingProgressively, setDisplayingProgressively] = useState(false);
    // Controls the main progress bar

    /**
     * Display item list one category at a time. This avoid one big refresh of the page, and allow a better
     * "Time to content" time of the page since the item list can be huge.
     * When a category is added, displayedDataLength state is modified, which trigger an effect calling this method again.
     */
    const displayItemListProgressively = () => {
        // Inspired by: https://itnext.io/handling-large-lists-and-tables-in-react-238397854625
        // setTimeout put the function at the end of the calling stack
        setTimeout(() => {
            if (props.categories && displayingProgressively) {
                const categoriesLength = props.categories.length;

                if (displayedDataLength < categoriesLength) {
                    // Load data by chunk of 1 category
                    const newLength = Math.min(categoriesLength, displayedDataLength + 1);
                    setDisplayedDataLength(newLength);
                } else {
                    setDisplayingProgressively(false);
                }
            }
        }, 0);
    };

    // On data change, trigger the "progressive" rendering of items.
    useEffect(() => {
        if (props.categories) {
            if (!displayingProgressively) {
                setDisplayingProgressively(true);
            }
        } else {
            setDisplayingProgressively(false);
            setDisplayedDataLength(0);
        }
    }, [props.categories]);

    // Display items "step by step"
    useEffect(() => {
        if (displayingProgressively) {
            displayItemListProgressively();
        }
    }, [displayingProgressively, displayedDataLength]);

    const renderCategoryComponent = (categoryProps: ItemCategory, index: number) => {
        if (index >= displayedDataLength || categoryProps.items.length == 0) {
            return null;
        }

        return (
            <CategoryListItem key={index} categoryProps={categoryProps} progress={props.progress}/>
        );
    };

    return (
        <List className={classes.list} disablePadding dense>
            {props.categories && props.categories.map((data: ItemCategory, index: number) => renderCategoryComponent(data, index))}
        </List>
    );
};

export default CategoryList;
