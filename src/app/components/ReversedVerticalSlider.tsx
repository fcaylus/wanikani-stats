import React from "react";
import {Slider, SliderProps} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    thumb: {
        transform: "rotate(90deg)"
    },
    valueLabel: {
        "& > span > span": {
            transform: "rotate(-45deg)"
        }
    }
}));

/**
 * Reversed vertical slider, ie. with the lowest value on the top, and the highest at the bottom.
 * It just multiply every occurrence of values by -1 for every properties
 */
export default function ReversedVerticalSlider(props: SliderProps) {
    const classes = useStyles();

    return (
        <Slider
            {...props}
            orientation="vertical"
            min={props.max ? props.max * -1 : -100}
            max={props.min ? props.min * -1 : 0}
            defaultValue={typeof props.defaultValue === "number" ? props.defaultValue * -1 : props.defaultValue}
            getAriaValueText={value => props.getAriaLabel ? props.getAriaLabel(-1 * value) : (-1 * value).toString()}
            marks={Array.isArray(props.marks) ? props.marks.map(mark => {
                return {value: mark.value * -1, label: mark.label};
            }) : props.marks}
            onChange={((event, value) => {
                if (props.onChange) {
                    if (typeof value === "number") {
                        props.onChange(event, -1 * value);
                    } else {
                        props.onChange(event, value);
                    }
                }
            })}
            onChangeCommitted={((event, value) => {
                if (props.onChangeCommitted) {
                    if (typeof value === "number") {
                        props.onChangeCommitted(event, -1 * value);
                    } else {
                        props.onChangeCommitted(event, value);
                    }
                }
            })}
            value={typeof props.value === "number" ? props.value * -1 : props.value}
            valueLabelFormat={props.valueLabelFormat && typeof props.valueLabelFormat !== "string" ? (value, index) => {
                // @ts-ignore
                return props.valueLabelFormat(-1 * value, index);
            } : (value => -1 * value)}
            track="inverted"
            classes={{
                ...props.classes,
                thumb: classes.thumb,
                valueLabel: classes.valueLabel
            }}
        />
    );
}
