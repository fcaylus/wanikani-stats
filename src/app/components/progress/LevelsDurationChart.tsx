import {LevelsHashMap} from "../../../data/interfaces/level";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Box, Card, CardContent, CardHeader, Divider, Typography} from "@material-ui/core";
import React from "react";
import {averageLevelDuration, durationOfLevel} from "../../levels";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ReferenceLine,
    ResponsiveContainer,
    Text,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import formatDuration from "../../../formatDuration";
import graphColorForValues from "../../graphColorForValues";
import colors from "../../colors";
import theme from "../../theme";

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        overflow: "auto"
    },
    box: {
        width: "100%"
    },
    content: {
        boxSizing: "border-box",
        marginBottom: theme.spacing(2),
        "& svg": {
            overflow: "visible"
        }
    },
    barLabel: {
        textAnchor: "start"
    },
    averageLabel: {
        width: "99%",
        textAlign: "end"
    }
}));

export interface LevelsDurationChartProps {
    levels?: LevelsHashMap;
}

const DAYS_MULTIPLIER = 1000 * 60 * 60 * 24;

const GRAPH_HEIGHT = 300;

/**
 * Label displayed on top of every bar
 */
const BarLabel = (props: any) => {
    const {x, y, width, fill, value} = props;
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
                {formatDuration(value * DAYS_MULTIPLIER)}
            </Text>
        );
    } else {
        // Render INSIDE the bar
        return (
            <Text
                x={x}
                y={y + width / 2}
                dx={-10}
                fill={colors.white}
                textAnchor="end"
                verticalAnchor="middle"
                transform={`rotate(-90, ${x}, ${y})`}>
                {formatDuration(value * DAYS_MULTIPLIER)}
            </Text>
        );
    }
};


/**
 * Display a "bar chart" of levels duration
 */
export default function LevelsDurationChart(props: LevelsDurationChartProps) {
    const classes = useStyles();

    // Convert to data types usable by recharts.js
    const generateGraphData = () => {
        if (!props.levels) {
            return [];
        }

        let data = [];

        for (const level of Object.values(props.levels)) {
            data.push({
                level: level.level,
                value: durationOfLevel(level) / DAYS_MULTIPLIER,
            });
        }
        return data;
    };

    if (!props.levels) {
        return null;
    }

    const data = generateGraphData();
    const colors = graphColorForValues(data.map((item) => item.value));
    const average = averageLevelDuration(Object.values(props.levels)) / DAYS_MULTIPLIER;

    // 60 is approximately the size of the left axis
    // 20 is the min size of a bar
    // 1.2 is for 10% empty space between each bar
    const minWidth = 60 + (20 * 1.2) * data.length;

    return (
        <Card>
            <CardHeader title="Time on Levels"/>
            <Divider/>
            <CardContent className={classes.container}>
                <Box className={classes.box} style={{
                    minWidth: minWidth + theme.spacing(1) * 2
                }}>
                    <Typography variant="body2" className={classes.averageLabel}>
                        <b>Average time: </b>
                        {formatDuration(average * DAYS_MULTIPLIER)}
                    </Typography>
                    <ResponsiveContainer height={GRAPH_HEIGHT} width={"99%"} minWidth={minWidth}
                                         className={classes.content}>
                        <BarChart data={data} margin={{
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0
                        }}>
                            <CartesianGrid vertical={false}/>
                            <XAxis dataKey="level" label={{
                                value: "Levels",
                                position: "bottom",
                            }}/>
                            <YAxis label={{
                                value: "Time on Level (days)",
                                angle: -90,
                                position: "insideLeft",
                                offset: 10,
                                style: {
                                    textAnchor: "middle",
                                }
                            }}/>

                            <Tooltip
                                formatter={(value: any) => {
                                    return [formatDuration(value * DAYS_MULTIPLIER), "Time on level"]
                                }}
                                labelFormatter={(value: any) => {
                                    return "Level " + value;
                                }}/>
                            <ReferenceLine y={average} ifOverflow="extendDomain" isFront={false}
                                           stroke={theme.palette.primary.light} strokeDasharray="5 4"
                                           strokeWidth={2}/>
                            <Bar dataKey="value" label={<BarLabel/>}>
                                {
                                    data.map((entry, index) => {
                                        return <Cell key={index} fill={colors[entry.value]}/>;
                                    })
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    )
}
