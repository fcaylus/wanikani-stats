import {makeStyles, Theme} from "@material-ui/core/styles";
import {Typography} from "@material-ui/core";
import React, {FunctionComponent, useEffect, useState} from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    ReferenceLine,
    Text,
    XAxis,
    YAxis
} from "recharts";
import graphColorForValues, {GraphColorsHashMap} from "../../graphColorForValues";
import colors from "../../colors";
import theme from "../../theme";
import ResponsiveChart, {GRAPH_HEIGHT, GRAPH_HEIGHT_SMALL} from "./ResponsiveChart";

const useStyles = makeStyles((theme: Theme) => ({
    innerLabel: {
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

const dataKeysSumValues = (item: ChartData, dataKeys: string[]) => {
    return dataKeys.reduce((sum, dataKey) => (sum + item[dataKey]), 0);
};

const maximumValueNotHidden = (data: ChartData[], hidden: number[], dataKeys: string[]) => {
    return Math.max(...(data.filter((item) => !hidden.includes(item.label)).map(item => dataKeysSumValues(item, dataKeys))));
};

const averageValue = (data: ChartData[], dataKeys: string[], excludeLast?: boolean) => {
    if (data.length == 0) {
        return 0;
    }
    const length = excludeLast ? data.length - 1 : data.length;
    return data.reduce((sum, item, index) => {
        return sum + (excludeLast && index == data.length - 1 ? 0 : dataKeysSumValues(item, dataKeys));
    }, 0) / length;
};

/**
 * Label displayed on top of (or inside depending on the size) every bar/points
 */
const Label = (props: any) => {
    const {x, y, width, fill, value, valueFormatter, small} = props;

    const formattedValue = typeof value === "number" ? valueFormatter(value) : (value ? value : "");
    const graphHeight = small ? GRAPH_HEIGHT_SMALL : GRAPH_HEIGHT;

    if (y > graphHeight / 2) {
        // Render ABOVE
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
        // Render INSIDE
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

const ChartComponent = (chartProps: any) => {
    if (chartProps.chartType == "bar") {
        return <BarChart {...chartProps}>{chartProps.children}</BarChart>;
    } else {
        return <AreaChart {...chartProps}>{chartProps.children}</AreaChart>;
    }
};

/**
 * Format of the data rendered by this chart
 */
export interface ChartData {
    // X value
    label: number;

    // Y values. By default, only "value" is accessed.
    [otherValues: string]: number;
}

/**
 * Formatter function for the displayed values
 */
export type ValueFormatter = (value: number) => string;

/**
 * Props for the chart
 */
export interface AdvancedResponsiveChartProps {
    // The actual data displayed.
    data: ChartData[];
    // The type of chart
    type: "bar" | "area";
    // The list of data keys used to display the chart (when there are several sets on the same graph)
    // If not specified, defaults to ["value"]
    dataKeys?: string[];
    // Enable auto coloring of data depending on values. If not set, a color object should be specified
    autoColoring?: boolean;
    // Colors of the graph (if no autoColoring). Must be as many colors as the length of dataKeys if specified
    colors?: string[];
    // Callback when a bar/point is clicked
    onHiddenChange?: (newHidden: number[]) => void;
    // If true, the average line is displayed
    showAverageLine?: boolean;
    // If true, the last value is excluded from the average
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
    // Minimal item width (optional).
    minimalItemSize?: number;
    // Disable clickability
    disableClick?: boolean;
    // Hide labels
    hideLabels?: boolean;
    // Reduce the height of the graph
    small?: boolean;
}

/**
 * General purpose graph. Having a single graph object allows consistent style and layout accross the app. The graph
 * supports different types: "bar" and "area". "area" type miss the following features:
 * - data points label (would be too compact)
 * - clickable and hiddent points (would be useless ?)
 * - autoColoring (doesn't really make sense)
 */
const AdvancedResponsiveChart: FunctionComponent<AdvancedResponsiveChartProps> = (props) => {
    const classes = useStyles();
    const [hidden, setHidden] = useState<number[]>([]);
    const [average, setAverage] = useState(0);
    const [graphColors, setGraphColors] = useState<GraphColorsHashMap[]>([]);
    // minWidth prevents from having too small items on small screens. The chart then becomes scrollable.
    const [minWidth, setMinWidth] = useState(0);
    // Default dataKeys
    const [dataKeys, setDataKeys] = useState<string[]>(props.dataKeys ? props.dataKeys : ["value"]);

    useEffect(() => {
        if (props.dataKeys) {
            setDataKeys(props.dataKeys)
        } else {
            setDataKeys(["value"])
        }
    }, [props.dataKeys]);

    useEffect(() => {
        if (props.data.length > 0) {
            if (props.autoColoring) {
                setGraphColors(dataKeys.map(dataKey => graphColorForValues(props.data.map((item) => item[dataKey]))));
            }
            if (props.showAverageLine) {
                setAverage(averageValue(props.data, dataKeys, props.excludeLastFromAverage));
            }
        }
    }, [props.data]);

    useEffect(() => {
        if (props.data.length > 0) {
            if (props.showAverageLine) {
                setAverage(averageValue(props.data, dataKeys, props.excludeLastFromAverage));
            }
        }
    }, [props.data, props.excludeLastFromAverage]);

    useEffect(() => {
        // 60 is approximately the size of the left axis
        // 20 is the min size of a bar/item
        // 1.2 is for 10% empty space between each bar
        setMinWidth(60 + ((props.minimalItemSize ? props.minimalItemSize : 20) * 1.2) * props.data.length);
    }, [props.data, props.minimalItemSize]);

    useEffect(() => {
        // Update average time and colors when the hidden items change
        if (props.data.length > 0) {
            if (props.onHiddenChange) {
                props.onHiddenChange(hidden);
            }

            // If the last item is already hidden, do not pass the param excludeLastFromAverage
            if (props.showAverageLine) {
                setAverage(averageValue(props.data.filter(item => !hidden.includes(item.label)), dataKeys,
                    hidden.includes(props.data[props.data.length - 1].label) ? false : props.excludeLastFromAverage));
            }
            // Update graph colors
            if (props.autoColoring) {
                setGraphColors(dataKeys.map(dataKey => graphColorForValues(props.data.filter(item => !hidden.includes(item.label)).map(item => item[dataKey]))));
            }
        }
    }, [hidden]);

    // On click, remove or append the clicked item to the hidden list
    const handleClick = (data: ChartData) => {
        const bar = data.label;
        if (hidden.includes(bar)) {
            setHidden(hidden.filter(value => value != bar));
        } else {
            setHidden([...hidden, bar]);
        }
    };

    const colorForDataKey = (dataKeyIndex: number) => {
        return props.colors ? props.colors[dataKeyIndex] : colors.black;
    };

    const colorForItem = (dataKeyIndex: number, dataKey: string, item: ChartData) => {
        if (props.autoColoring) {
            return !hidden.includes(item.label) && graphColors[dataKeyIndex] ? graphColors[dataKeyIndex][item[dataKey]] : colors.unknown;
        } else {
            return colorForDataKey(dataKeyIndex);
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
            footer={props.footerText ? renderFooter() : undefined}
            small={props.small}>
            <ChartComponent chartType={props.type} data={props.data} margin={{
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            }}>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="label" label={{
                    value: props.xLabel,
                    position: "bottom",
                    offset: 0
                }}/>
                <YAxis
                    domain={[0, Math.ceil(maximumValueNotHidden(props.data, hidden, dataKeys) * 1.1)]}
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
                {props.children}
                {dataKeys.map((dataKey, dataKeyIndex) => {
                    if (props.type == "bar") {
                        return (
                            <Bar key={dataKey} dataKey={dataKey} stackId="mainStack"
                                 onClick={props.disableClick ? undefined : handleClick}
                                 fill={colorForDataKey(dataKeyIndex)}>
                                {!props.hideLabels && (
                                    <LabelList dataKey={dataKey} content={(labelProps) => {
                                        return <Label {...labelProps}
                                                      small={!!props.small}
                                                      valueFormatter={props.valueFormatter ? props.valueFormatter : (x: number) => x.toString()}/>
                                    }}/>
                                )}

                                {props.data.map((item, index) => <Cell key={index}
                                                                       fill={colorForItem(dataKeyIndex, dataKey, item)}
                                                                       stroke={colorForItem(dataKeyIndex, dataKey, item)}/>)}
                            </Bar>
                        );
                    } else {
                        return (
                            <Area key={dataKey}
                                  dataKey={dataKey}
                                  stackId="mainStack"
                                  type="linear"
                                  fill={colorForDataKey(dataKeyIndex)}
                                  stroke={colorForDataKey(dataKeyIndex)}/>
                        );
                    }
                })}
            </ChartComponent>
        </ResponsiveChart>
    );
};

export default AdvancedResponsiveChart;
