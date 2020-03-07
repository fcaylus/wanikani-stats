import React from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Box, Typography} from "@material-ui/core";
import ItemCard from "./ItemCard";
import {ProgressHashMap} from "../../../data/interfaces/progress";
import {ItemCategory} from "../../../data/interfaces/item";

const useStyles = makeStyles((theme: Theme) => ({
    header: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        "& > *": {
            paddingRight: theme.spacing(1)
        }
    },
    list: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap"
    },
    item: {
        width: "unset",
        marginRight: 4,
        marginBottom: 4
    }
}));

/**
 * Grid list of a set of specified items
 */
export default React.memo((props: ItemCategory & { progress?: ProgressHashMap }) => {
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
            <div className={classes.list}>
                {props.items.map((item, index) => (
                    <ItemCard {...item}
                              srs={props.progress && props.progress[item.name] ? props.progress[item.name] : 0}
                              className={classes.item}
                              key={index}/>
                ))}
            </div>
        </React.Fragment>

    );
});
