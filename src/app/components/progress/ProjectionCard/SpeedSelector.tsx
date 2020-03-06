import React from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Box, FormControl, Input, InputAdornment, Typography} from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        "& > *": {
            flexGrow: 0,
            margin: theme.spacing(1),
            "&:not(:first-child)": {
                maxWidth: 100
            }
        }
    }
}));

interface SpeedSelectorProps {
    valueHours: number;
    onChangeHours: (newHours: number) => void;
    valueDays: number;
    onChangeDays: (newDays: number) => void;
    className?: string;
}

/**
 * Two number inputs that allows to select a time
 */
export default function SpeedSelector(props: SpeedSelectorProps) {
    const classes = useStyles();

    const updateDays = (days: any) => {
        if (!isNaN(days)) {
            props.onChangeDays(days);
        }
    };

    const updateHours = (hours: any) => {
        if (!isNaN(hours)) {
            props.onChangeHours(hours);
        }
    };

    return (
        <Box className={clsx(classes.root, props.className)}>
            <Typography variant="subtitle2">
                Select your target level-up speed:
            </Typography>
            <FormControl>
                <Input
                    id="levelup-days"
                    value={props.valueDays}
                    onChange={(event) => updateDays(event.target.value)}
                    endAdornment={<InputAdornment position="end">days</InputAdornment>}
                    type="number"
                    inputProps={{
                        "aria-label": "levelup-days-selector",
                        min: "3"
                    }}/>
            </FormControl>
            <FormControl>
                <Input
                    id="levelup-hours"
                    value={props.valueHours}
                    onChange={(event) => updateHours(event.target.value)}
                    endAdornment={<InputAdornment position="end">hours</InputAdornment>}
                    type="number"
                    inputProps={{
                        "aria-label": "levelup-hours-selector",
                        min: "0",
                    }}/>
            </FormControl>
        </Box>

    );
}
