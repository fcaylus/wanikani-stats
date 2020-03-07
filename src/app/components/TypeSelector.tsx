import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Paper, Tab, Tabs} from "@material-ui/core";
import {itemTypes} from "../../data/data";
import {displayNameForType} from "../types";

const useStyles = makeStyles(() => ({
    root: {
        width: "100%",
    },
}));

interface SourceSelectorProps {
    onTypeChange: (newType: string) => void;
    value?: string;
}

/**
 * Tab bar that allows to select the items type
 */
const TypeSelector = React.memo((props: SourceSelectorProps) => {
    const classes = useStyles();

    const handleTabChange = (_event: React.ChangeEvent<{}>, newItemType: string) => {
        props.onTypeChange(newItemType);
    };

    return (
        <Paper className={classes.root} elevation={5}>
            <Tabs
                value={props.value}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                centered
            >
                {itemTypes().map((type) => {
                    return <Tab key={type} label={displayNameForType(type)} value={type}
                                disableRipple disableTouchRipple/>
                })}
            </Tabs>
        </Paper>
    );
});

export default TypeSelector;
