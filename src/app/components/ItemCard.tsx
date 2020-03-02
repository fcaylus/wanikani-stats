import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Button} from "@material-ui/core";
import {Item} from "../../data/interfaces/item";
import clsx from "clsx";
import colors from "../colors";
import {colorForSRS} from "../srs";

const useStyles = makeStyles(() => ({
    item: {
        //fontWeight: "bold",
        padding: 4,
        minWidth: "unset",
        height: 32,
        transition: "none",
        backgroundColor: colors.unknown,
        color: "#000000",
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

    const title = displayedText + (props.readings ? (" (" + props.readings.join(" / ") + ")") : "");

    return (
        <Button
            size="medium"
            variant="contained"
            component="a"
            href={props.url}
            target="_blank"
            className={clsx(classes.item, props.className)}
            style={{
                color: (props.srs && props.srs > 0) ? "#fff" : undefined,
                backgroundColor: (props.srs && props.srs > 0) ? colorForSRS(props.srs) : undefined,
            }}
            disableRipple
            disableFocusRipple
            disableTouchRipple
            title={title}
            lang="jp">
            {imageComponent ? imageComponent : displayedText}
        </Button>
    );
});
