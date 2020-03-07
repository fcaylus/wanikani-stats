import React from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Box, Paper, Typography} from "@material-ui/core";
import clsx from "clsx";
import {LEVEL_CATEGORIES} from "../../../../data/common";
import capitalize from "../../../../capitalize";
import colors from "../../../colors";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between"
    },
    paper: {
        textAlign: "center",
        color: colors.white,
        "& > *:first-child": {
            fontWeight: "bold"
        },
        padding: theme.spacing(1),
    }
}));

/**
 * Display levels categories cards
 */
export default function LevelCategories(props: { className?: string }) {
    const classes = useStyles();

    return (
        <Box className={clsx(classes.root, props.className)}>
            {LEVEL_CATEGORIES.map((category, index) => (
                <React.Fragment key={index}>
                    <Paper className={classes.paper} style={{backgroundColor: category.color}}>
                        <Typography variant="body2" component="p" lang="ja">{category.kanji}</Typography>
                        <Typography variant="caption" component="p">{capitalize(category.name)}</Typography>
                    </Paper>
                </React.Fragment>
            ))}
        </Box>
    );
}
