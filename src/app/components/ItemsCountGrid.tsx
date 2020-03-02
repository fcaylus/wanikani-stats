import React from 'react';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {Grid, Paper, Typography} from "@material-ui/core";
import clsx from "clsx";
import {ProgressItemsCount} from "../../data/interfaces/progress";
import {colorForSRS, nameForSRS, srsGroups} from "../srs";
import colors from "../colors";

const useStyles = makeStyles((theme: Theme) => ({
    root: {},
    paper: {
        padding: theme.spacing(3),
        textAlign: "center",
        color: colors.white,
        "& > *:first-child": {
            fontWeight: "bold"
        }
    },
}));

interface ItemsCountProps {
    itemsCount?: ProgressItemsCount;
    className?: any;
}

export default function ItemsCountGrid(props: ItemsCountProps) {
    const classes = useStyles();

    return (
        <Grid container spacing={2} className={clsx(classes.root, props.className)}>
            {props.itemsCount && srsGroups().map((group) => {
                // @ts-ignore
                const sum = group.reduce((sum, srs) => sum + (props.itemsCount.srs[srs] ? props.itemsCount.srs[srs] : 0), 0);

                return (
                    <Grid item xs>
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
