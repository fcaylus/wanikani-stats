import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Button} from "@material-ui/core";
import colorFromSRS from "../colorFromSRS";
import {Item} from "../../data/interfaces/item";
import clsx from "clsx";

const useStyles = makeStyles(() => ({
    item: {
        //fontWeight: "bold",
        padding: 4,
        minWidth: "unset",
        height: 32,
        transition: "none"
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
            className={clsx(classes.item, props.className)}
            style={{
                color: (props.srs && props.srs > 0) ? "#fff" : "#000",
                backgroundColor: colorFromSRS(props.srs),
            }}
            disableRipple
            disableFocusRipple
            disableTouchRipple
            title={displayedText}>
            {imageComponent ? imageComponent : displayedText}
        </Button>
    );
});
