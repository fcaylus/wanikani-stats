import {Level, LevelsHashMap} from "../../../data/interfaces/level";
import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent, CardHeader, Divider} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {durationOfLevel} from "../../levels";
import {Tooltip} from "recharts";
import formatDuration from "../../../formatDuration";
import AdvancedResponsiveChart, {ChartData} from "../charts/AdvancedResponsiveChart";

const useStyles = makeStyles(() => ({
    container: {
        overflow: "auto"
    }
}));

export interface LevelsDurationChartProps {
    levels?: LevelsHashMap;
}

const DAYS_MULTIPLIER = 1000 * 60 * 60 * 24;

// Convert to data types usable by recharts.js
const generateGraphData = (levels: Level[]): ChartData[] => {
    let data = [];

    for (const level of levels) {
        data.push({
            label: level.level,
            value: durationOfLevel(level) / DAYS_MULTIPLIER,
        });
    }
    return data;
};

/**
 * Display a "bar chart" of levels duration
 */
export default function LevelsDurationChart(props: LevelsDurationChartProps) {
    const classes = useStyles();
    const [data, setData] = useState<ChartData[]>([]);

    // When levels data are available, update the state
    useEffect(() => {
        if (props.levels) {
            const data = generateGraphData(Object.values(props.levels));
            setData(data);
        }
    }, [props.levels]);

    if (!props.levels) {
        return null;
    }

    return (
        <Card>
            <CardHeader title="Time on Levels"/>
            <Divider/>
            <CardContent className={classes.container}>
                <AdvancedResponsiveChart
                    data={data}
                    type="bar"
                    autoColoring
                    showAverageLine
                    excludeLastFromAverage
                    averageLineLabel="Average time:"
                    footerText="Click on a level to exclude it from the graph and the average time calculation."
                    valueFormatter={(value => formatDuration(value * DAYS_MULTIPLIER))}
                    xLabel="Levels"
                    yLabel="Time on Level (days)">
                    <Tooltip
                        formatter={(value: any) => {
                            return [formatDuration(value * DAYS_MULTIPLIER), "Time on level"]
                        }}
                        labelFormatter={(value: any) => "Level " + value}/>
                </AdvancedResponsiveChart>
            </CardContent>
        </Card>
    )
};
