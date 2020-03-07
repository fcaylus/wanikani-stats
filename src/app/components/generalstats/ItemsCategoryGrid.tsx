import React from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Grid, Paper, Typography} from "@material-ui/core";
import colors from "../../colors";
import {ItemCategory} from "../../../data/interfaces/item";

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

interface ItemsCategoryGridProps {
    radicals?: ItemCategory[];
    kanjis?: ItemCategory[];
    vocabularies?: ItemCategory[];
}

/**
 * Display WK categories with card containers (just like SRS items count)
 */
export default function ItemsCategoryGrid(props: ItemsCategoryGridProps) {
    const classes = useStyles();

    const countItems = (categories?: ItemCategory[]) => {
        if (!categories) {
            return 0;
        }

        return categories.reduce((sum, itemList) => sum + itemList.items.length, 0);
    };

    return (
        <Grid container spacing={2} className={classes.root}>
            <Grid item xs>
                <Paper className={classes.paper} style={{backgroundColor: colors.radical}}>
                    <Typography variant="h6" component="p">Radicals</Typography>
                    <Typography variant="body1" component="p">
                        {countItems(props.radicals)}
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs>
                <Paper className={classes.paper} style={{backgroundColor: colors.kanji}}>
                    <Typography variant="h6" component="p">Kanjis</Typography>
                    <Typography variant="body1" component="p">
                        {countItems(props.kanjis)}
                    </Typography>
                </Paper>
            </Grid>
            <Grid item xs>
                <Paper className={classes.paper} style={{backgroundColor: colors.vocabulary}}>
                    <Typography variant="h6" component="p">Vocabularies</Typography>
                    <Typography variant="body1" component="p">
                        {countItems(props.vocabularies)}
                    </Typography>
                </Paper>
            </Grid>
        </Grid>
    );
}
