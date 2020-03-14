import React, {useEffect, useRef, useState} from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Box, Typography} from "@material-ui/core";
import ItemCard, {ITEM_HEIGHT, ITEM_PADDING, ITEM_SPACING, ITEM_WIDTH} from "./ItemCard";
import {ProgressHashMap} from "../../../data/interfaces/progress";
import {Item, ItemCategory} from "../../../data/interfaces/item";
import ReactResizeDetector from "react-resize-detector";
import colors from "../../colors";

const useStyles = makeStyles((theme: Theme) => ({
    header: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        "& > *": {
            paddingRight: theme.spacing(1)
        }
    },
    listContainer: {
        width: "100%"
    }
}));

interface SVGListProps {
    items: Item[];
    itemsType: string;
    progress?: ProgressHashMap;
    width?: number;
}

const SVGList = React.memo((props: SVGListProps) => {
    const textMeasurer = useRef<SVGTextElement>(null);
    const [textLengths, setTextLengths] = useState<number[]>([]);
    const [displayedTexts, setDisplayedTexts] = useState<string[]>([]);

    /**
     * Computed the length of each items
     */
    useEffect(() => {
        let texts = [];
        let lengths = [];

        // For radicals and kanjis, use the minimal default width
        for (const item of props.items) {
            const displayedText = item.characters ? item.characters : "";
            let width = ITEM_WIDTH;
            if (props.itemsType === "vocabulary" && displayedText != "") {
                width = Math.max(ITEM_WIDTH, findTextWidth(displayedText) + ITEM_PADDING * 2);
            }

            texts.push(displayedText);
            lengths.push(width);
        }

        // Remove the last text measured
        if (textMeasurer && textMeasurer.current) {
            textMeasurer.current.textContent = "";
        }

        setTextLengths(lengths);
        setDisplayedTexts(texts);
    }, [props.items]);


    /**
     * Compute the pixel-width of the specified text
     */
    const findTextWidth = (text?: string): number => {
        if (text && text.length > 0 && textMeasurer && textMeasurer.current) {
            textMeasurer.current.textContent = text;
            return textMeasurer.current.getComputedTextLength();
        }
        return ITEM_WIDTH;
    };

    /**
     * Compute the height depending on the width and the size of items
     */
    const findHeight = () => {
        if (!props.width) {
            return 0;
        }

        let w = 0;
        let line = 0;
        for (const length of textLengths) {
            w += length;
            if (w > props.width) {
                w = length;
                line++;
            }
            w += ITEM_SPACING;
        }

        return (line + 1) * (ITEM_HEIGHT + ITEM_SPACING);
    };

    /**
     * Find the x and y coordinates for a specified card
     */
    const xyForIndex = (index: number) => {
        if (!props.width) {
            return [0, 0];
        }

        let x = 0;
        let y = 0;
        for (let i = 0; i < index; i++) {
            x += textLengths[i] + ITEM_SPACING;
            if (x > (props.width - textLengths[i + 1])) {
                x = 0;
                y += ITEM_HEIGHT + ITEM_SPACING;
            }
        }

        return [x, y]
    };

    return (
        <svg width={props.width ? props.width : 0} height={findHeight()} version="1.1"
             xmlns="http://www.w3.org/2000/svg">
            <text ref={textMeasurer} fill={colors.white}/>
            <defs>
                <filter id="card-shadow">
                    <feDropShadow dx={1} dy={2} stdDeviation={1} floodColor={"rgba(0,0,0,0.2)"}/>
                </filter>
            </defs>
            {props.items.map((item, index) => {
                const [x, y] = xyForIndex(index);
                return (
                    <ItemCard key={index} x={x} y={y} width={textLengths[index]} text={displayedTexts[index]} item={{
                        ...item,
                        srs: props.progress && props.progress[item.name] ? props.progress[item.name] : 0
                    }}/>
                );
            })}
        </svg>
    );
});

/**
 * Grid list of a set of specified items. The actual list is an SVG element
 */
export default ((props: ItemCategory & { progress?: ProgressHashMap }) => {
    const classes = useStyles();

    if (props.items.length == 0) {
        return null;
    }

    return (
        <React.Fragment>
            {props.headerText && (
                <Box className={classes.header}>
                    <Typography variant="h6">{props.headerText}</Typography>
                    <Typography variant="body1">({props.items.length} items)</Typography>
                </Box>
            )}
            <Box className={classes.listContainer}>
                <ReactResizeDetector handleWidth refreshMode="throttle">
                    {({width}: { width: number }) => (
                        <SVGList items={props.items}
                                 itemsType={props.itemsType}
                                 width={width}
                                 progress={props.progress}/>
                    )}
                </ReactResizeDetector>
            </Box>
        </React.Fragment>

    );
});
