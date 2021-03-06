import React from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Grid, Paper, Typography} from "@material-ui/core";
import clsx from "clsx";
import {ProgressItemsCount} from "../../../data/interfaces/progress";
import {colorForSRS, nameForSRS, srsGroups} from "../../srs";
import colors from "../../colors";

const useStyles = makeStyles((theme: Theme) => ({
    root: {},
    paper: {
        textAlign: "center",
        color: colors.white,
        "& > *:first-child": {
            fontWeight: "bold"
        },
        padding: theme.spacing(3),
        [theme.breakpoints.down("xs")]: {
            padding: theme.spacing(2)
        }
    }
}));

interface ItemsCountProps {
    itemsCount?: ProgressItemsCount;
    className?: any;
}

/**
 * Display item counts by type as a banner (like on the WaniKani website)
 */
export default function ItemsCountGrid(props: ItemsCountProps) {
    const classes = useStyles();

    if (!props.itemsCount) {
        return null;
    }

    return (
        <Grid container spacing={2} className={clsx(classes.root, props.className)}>
            {props.itemsCount && srsGroups().map((group, index) => {
                // @ts-ignore
                const sum = group.reduce((sum, srs) => sum + (props.itemsCount.srs[srs] ? props.itemsCount.srs[srs] : 0), 0);

                return (
                    <Grid key={index} item xs>
                        <Paper className={classes.paper} style={{
                            backgroundColor: colorForSRS(group[0])
                        }}>
                            <Typography variant="h6" component="p">{nameForSRS(group[0])}</Typography>
                            <Typography variant="body1" component="p">{sum}</Typography>
                        </Paper>
                    </Grid>
                );
            })}
        </Grid>
    );
}
