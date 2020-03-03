import {LevelsHashMap} from "../../../data/interfaces/level";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Card, CardContent, CardHeader, Divider} from "@material-ui/core";
import React from "react";
import {durationOfLevel} from "../../levels";
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Text, Tooltip, XAxis, YAxis} from "recharts";
import formatDuration from "../../../formatDuration";
import graphColorForValues from "../../graphColorForValues";
import colors from "../../colors";

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
    },
    content: {
        marginBottom: theme.spacing(2),
        "& svg": {
            overflow: "visible"
        }
    },
    barLabel: {
        textAnchor: "start"
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
                value: durationOfLevel(level) / DAYS_MULTIPLIER
            });
        }
        return data;
    };

    const data = generateGraphData();
    const colors = graphColorForValues(data.map((item) => item.value));

    return (
        <Card>
            <CardHeader title="Time on Levels"/>
            <Divider/>
            <CardContent className={classes.container}>
                {props.levels && (
                    <ResponsiveContainer height={GRAPH_HEIGHT} width="99%" className={classes.content}>
                        <BarChart data={data}>
                            <CartesianGrid vertical={false}/>
                            <XAxis dataKey="level" label={{
                                value: "Levels",
                                position: "bottom",
                            }}/>
                            <YAxis label={{
                                value: "Time on Level (days)",
                                angle: -90,
                                position: "insideLeft",
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
                            <Bar dataKey="value" label={<BarLabel/>}>
                                {
                                    data.map((entry) => {
                                        return <Cell fill={colors[entry.value]}/>;
                                    })
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
