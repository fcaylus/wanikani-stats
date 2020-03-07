import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Button} from "@material-ui/core";
import {Item} from "../../../data/interfaces/item";
import clsx from "clsx";
import colors from "../../colors";
import {colorForSRS} from "../../srs";

const useStyles = makeStyles(() => ({
    item: {
        padding: 4,
        minWidth: "unset",
        height: 32,
        transition: "none",
        backgroundColor: colors.unknown,
        color: colors.black,
        textTransform: "capitalize"
    },
    image: {
        width: 16,
        height: 16
    }
}));

/**
 * Display any item (kanji, radical, vocabulary) as an inline card shape.
 * This component uses memoization since it rarely change after the first rendering and only depends on its props.
 */
export default React.memo((props: Item & { className?: string }) => {
    const classes = useStyles();

    const displayedText = props.characters ? props.characters : props.name;
    const imageComponent = !props.characters && props.image ?
        <img className={classes.image} alt={displayedText} src={props.image}/> : null;

    return (
        <Button
            size="medium"
            variant="contained"
            component="a"
            href={props.url}
            target="_blank"
            rel="noopener"
            className={clsx(classes.item, props.className)}
            style={{
                color: (props.srs && props.srs > 0) ? "#fff" : undefined,
                backgroundColor: (props.srs && props.srs > 0) ? colorForSRS(props.srs) : undefined,
            }}
            disableRipple
            disableFocusRipple
            disableTouchRipple
            title={displayedText + (props.readings ? (" (" + props.readings.join(" / ") + ")") : "")}
            lang="ja">
            {imageComponent ? imageComponent : displayedText}
        </Button>
    );
});
