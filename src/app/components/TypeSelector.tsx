import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {Paper, Tab, Tabs} from "@material-ui/core";
import itemTypesJson from "../../data/item_types.json";

const itemTypesList = Object(itemTypesJson);

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
                {Object.keys(itemTypesJson).map((type: string) => {
                    return <Tab key={type} label={itemTypesList[type].display_name} value={type}
                                disableRipple disableTouchRipple/>
                })}
            </Tabs>
        </Paper>
    );
});

export default TypeSelector;
