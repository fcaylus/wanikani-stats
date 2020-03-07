import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Box, Link, Typography} from "@material-ui/core";
import {SourceInfo} from "../../data/interfaces/sourceinfo";

const useStyles = makeStyles(() => ({
    root: {},
}));

/**
 * Display information about a specified source
 */
const SourceInfoLabel = (props: { info: SourceInfo }) => {
    const classes = useStyles();

    return (
        <Box className={classes.root}>
            {props.info.info && (
                <Typography variant="caption">
                    {props.info.info}
                </Typography>
            )}
            <Typography variant="caption">
                Taken from&nbsp;
                <Link href={props.info.url} target="_blank" rel="noopener">
                    {props.info.websiteName}
                </Link>
                .
            </Typography>
        </Box>
    );
};

export default SourceInfoLabel;
