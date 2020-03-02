import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {FormControl, FormControlLabel, FormLabel, Radio, RadioGroup} from "@material-ui/core";
import sourceTypesJson from "../../data/source_types.json";
import itemTypesJson from "../../data/item_types.json";

const sourceTypesList = Object(sourceTypesJson);
const itemTypesList = Object(itemTypesJson);

const sourcesForType = (type: string) => {
    return itemTypesList[type].sources;
};

const useStyles = makeStyles(() => ({
    radioGroup: {
        flexDirection: "row"
    },
}));

interface SourceSelectorProps {
    itemType: string;
    onSourceChange: (newSource: string) => void;
    value?: string;
    // Exclude specific sources from teh displayed one
    excludeList?: string[];
}

/**
 * Radio button list to select to source for the specified itemType.
 */
const SourceSelector = React.memo((props: SourceSelectorProps) => {
    const classes = useStyles();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSource = (event.target as HTMLInputElement).value;
        props.onSourceChange(newSource);
    };

    return (
        <FormControl component="fieldset">
            <FormLabel component="legend">Displayed source</FormLabel>
            <RadioGroup aria-label="sources" name="sources" value={props.value} onChange={handleChange}
                        className={classes.radioGroup}>
                {sourcesForType(props.itemType).map((availableSource: string) => {
                    if (props.excludeList && props.excludeList.includes(availableSource)) {
                        return null;
                    }

                    return <FormControlLabel key={availableSource} value={availableSource}
                                             control={<Radio disableRipple disableTouchRipple/>}
                                             label={sourceTypesList[availableSource].display_name}/>
                })}
            </RadioGroup>
        </FormControl>
    );
});

export default SourceSelector;
