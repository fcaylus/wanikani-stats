import {makeStyles, Theme} from "@material-ui/core/styles";
import {Typography} from "@material-ui/core";
import React, {FunctionComponent, useEffect, useState} from "react";
import {Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, Text, XAxis, YAxis} from "recharts";
import graphColorForValues, {GraphColorsHashMap} from "../../graphColorForValues";
import colors from "../../colors";
import theme from "../../theme";
import ResponsiveChart, {GRAPH_HEIGHT} from "./ResponsiveChart";

const useStyles = makeStyles((theme: Theme) => ({
    barLabel: {
        textAnchor: "start"
    },
    averageLabel: {
        width: "99%",
        textAlign: "end"
    },
    explanationLabel: {
        width: "fit-content",
        textAlign: "center",
        paddingTop: theme.spacing(1)
    }
}));

const maximumValueNotHidden = (data: BarChartData[], hidden: number[]) => {
    return Math.max(...(data.filter((item) => !hidden.includes(item.bar)).map(item => item.value)));
};

const averageValue = (data: BarChartData[], excludeLast?: boolean) => {
    if (data.length == 0) {
        return 0;
    }
    const length = excludeLast ? data.length - 1 : data.length;
    return data.reduce((sum, item, index) => {
        return sum + (excludeLast && index == data.length - 1 ? 0 : item.value);
    }, 0) / length;
};

/**
 * Label displayed on top of (or inside depending on the size) every bar
 */
const BarLabel = (props: any) => {
    const {x, y, width, fill, value, valueFormatter} = props;

    const formattedValue = typeof value === "number" ? valueFormatter(value) : (value ? value : "");

    if (y > GRAPH_HEIGHT / 2) {
        // Render ABOVE the bar
        return (
            <Text
                x={x}
                y={y + width / 2}
                dx={10}
                fill={fill}
                textAnchor="start"
                verticalAnchor="middle"
                transform={`rotate(-90, ${x}, ${y})`}>
                {formattedValue}
            </Text>
        );
    } else {
        // Render INSIDE the bar
        return (
            <Text
                x={x}
                y={y + width / 2}
                dx={-10}
                fill={theme.palette.getContrastText(fill ? fill : "#fff")}
                textAnchor="end"
                verticalAnchor="middle"
                transform={`rotate(-90, ${x}, ${y})`}>
                {formattedValue}
            </Text>
        );
    }
};

/**
 * Format of the data rendered by this bar chart
 */
export interface BarChartData {
    // X value
    bar: number;
    // Y value
    value: number;
}

/**
 * Formatter function for the displayed values
 */
export type ValueFormatter = (value: number) => string;

/**
 * Props for ClickableBarChart
 */
export interface ClickableBarChartProps {
    // The actual data displayed
    data: BarChartData[];
    // Callback when a bar was clicked
    onHiddenBarsChange?: (newHiddenBars: number[]) => void;
    // If true, the average line is displayed
    showAverageLine?: boolean;
    // If true, the last bar is excluded from the average
    excludeLastFromAverage?: boolean;
    // The label of the average line
    averageLineLabel?: string;
    // Optional footer text
    footerText?: string;
    // Function that format displayed values. If not specified, the raw numbers are displayed
    valueFormatter?: ValueFormatter;
    // X axis label
    xLabel?: string;
    // Y axis label
    yLabel?: string;
}

/**
 * Display a "bar chart" which is clickable and fully responsive. When a bar is clicked, it's hidden and exclude
 * from the average value.
 */
const ClickableBarChart: FunctionComponent<ClickableBarChartProps> = (props) => {
    const classes = useStyles();
    const [hiddenBars, setHiddenBars] = useState<number[]>([]);
    const [average, setAverage] = useState(0);
    const [graphColors, setGraphColors] = useState<GraphColorsHashMap>({});
    // minWidth prevents from having too small bars on small screens. The chart becomes then scrollable.
    const [minWidth, setMinWidth] = useState(0);

    // When levels data are available, update the state
    useEffect(() => {
        if (props.data.length > 0) {
            setGraphColors(graphColorForValues(props.data.map((item) => item.value)));
            setAverage(averageValue(props.data, props.excludeLastFromAverage));

            // 60 is approximately the size of the left axis
            // 20 is the min size of a bar
            // 1.2 is for 10% empty space between each bar
            setMinWidth(60 + (20 * 1.2) * props.data.length);
        }
    }, [props.data]);

    useEffect(() => {
        // Update average time and colors when the hidden levels change
        if (props.data.length > 0) {
            if (props.onHiddenBarsChange) {
                props.onHiddenBarsChange(hiddenBars);
            }

            // If the last item is already hidden, do not pass the param excludeLastFromAverage
            setAverage(averageValue(props.data.filter(item => !hiddenBars.includes(item.bar)),
                hiddenBars.includes(props.data[props.data.length - 1].bar) ? false : props.excludeLastFromAverage));
            // Update graph colors
            setGraphColors(graphColorForValues(props.data.filter(item => !hiddenBars.includes(item.bar)).map(item => item.value)));
        }
    }, [hiddenBars]);

    // On click, remove or append the clicked bar to the hiddenBars list
    const handleClick = (data: BarChartData) => {
        const bar = data.bar;
        if (hiddenBars.includes(bar)) {
            setHiddenBars(hiddenBars.filter(value => value != bar));
        } else {
            setHiddenBars([...hiddenBars, bar]);
        }
    };

    const renderHeader = () => {
        return (
            <Typography variant="body2" className={classes.averageLabel}>
                <b>{props.averageLineLabel}&nbsp;</b>
                {props.valueFormatter ? props.valueFormatter(average) : average.toString()}
            </Typography>
        );
    };

    const renderFooter = () => {
        return (
            <Typography variant="body2" className={classes.explanationLabel}>
                <i>{props.footerText}</i>
            </Typography>
        );
    };

    return (
        <ResponsiveChart
            minWidth={minWidth}
            header={props.showAverageLine && props.averageLineLabel ? renderHeader() : undefined}
            footer={props.footerText ? renderFooter() : undefined}>
            <BarChart data={props.data} margin={{
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            }}>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="level" label={{
                    value: props.xLabel,
                    position: "bottom",
                    offset: 0
                }}/>
                <YAxis
                    domain={[0, Math.ceil(maximumValueNotHidden(props.data, hiddenBars) * 1.1)]}
                    allowDataOverflow={true}
                    label={{
                        value: props.yLabel,
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        style: {
                            textAnchor: "middle",
                        }
                    }}/>
                {props.showAverageLine && (
                    <ReferenceLine y={average} ifOverflow="extendDomain" isFront={false}
                                   stroke={theme.palette.primary.light} strokeDasharray="5 4"
                                   strokeWidth={2}/>
                )}
                <Bar dataKey="value" onClick={handleClick}>
                    <LabelList dataKey="value" content={(labelProps) => {
                        return <BarLabel {...labelProps}
                                         valueFormatter={props.valueFormatter ? props.valueFormatter : (x: number) => x.toString()}/>
                    }}/>

                    {props.data.map((item, index) => {
                        return <Cell key={index}
                                     fill={hiddenBars.includes(item.bar) ? colors.unknown : graphColors[item.value]}/>;
                    })}
                </Bar>
            </BarChart>
        </ResponsiveChart>
    );
};

export default ClickableBarChart;
