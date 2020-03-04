import {Level, LevelsHashMap} from "../../../data/interfaces/level";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Box, Card, CardContent, CardHeader, Divider, Typography} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {averageLevelDuration, durationOfLevel} from "../../levels";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    ReferenceLine,
    ResponsiveContainer,
    Text,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import formatDuration from "../../../formatDuration";
import graphColorForValues, {GraphColorsHashMap} from "../../graphColorForValues";
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
    },
    explanationLabel: {
        width: "fit-content",
        textAlign: "center",
        paddingTop: theme.spacing(1)
    }
}));

export interface LevelsDurationChartProps {
    levels?: LevelsHashMap;
}

interface GraphData {
    level: number;
    // Duration in days
    value: number;
}

const DAYS_MULTIPLIER = 1000 * 60 * 60 * 24;
const GRAPH_HEIGHT = 300;

// Convert to data types usable by recharts.js
const generateGraphData = (levels: Level[]): GraphData[] => {
    let data = [];

    for (const level of levels) {
        data.push({
            level: level.level,
            value: durationOfLevel(level) / DAYS_MULTIPLIER,
        });
    }
    return data;
};

const maximumValueNotHidden = (data: GraphData[], hidden: number[]) => {
    return Math.max(...(data.filter((value) => !hidden.includes(value.level)).map(value => value.value)));
};

/**
 * Label displayed on top of every bar
 */
const BarLabel = (props: any) => {
    const {x, y, width, fill, value} = props;

    const formattedDuration = formatDuration(value * DAYS_MULTIPLIER);

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
                {formattedDuration}
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
                {formattedDuration}
            </Text>
        );
    }
};

/**
 * Display a "bar chart" of levels duration
 */
export default function LevelsDurationChart(props: LevelsDurationChartProps) {
    const classes = useStyles();
    const [hiddenLevels, setHiddenLevels] = useState<number[]>([]);
    const [data, setData] = useState<GraphData[]>([]);
    const [averageTime, setAverageTime] = useState(0);
    const [graphColors, setGraphColors] = useState<GraphColorsHashMap>({});
    const [minWidth, setMinWidth] = useState(0);

    // When levels data are available, update the state
    useEffect(() => {
        if (props.levels) {
            const data = generateGraphData(Object.values(props.levels));
            setData(data);
            setGraphColors(graphColorForValues(data.map((item) => item.value)));
            setAverageTime(averageLevelDuration(Object.values(props.levels)) / DAYS_MULTIPLIER);

            // 60 is approximately the size of the left axis
            // 20 is the min size of a bar
            // 1.2 is for 10% empty space between each bar
            setMinWidth(60 + (20 * 1.2) * data.length);
        }
    }, [props.levels]);

    useEffect(() => {
        // Update average time and colors when the hidden levels change
        if (props.levels && data.length > 0) {
            setAverageTime(averageLevelDuration(Object.values(props.levels).filter(level => !hiddenLevels.includes(level.level))) / DAYS_MULTIPLIER);
            setGraphColors(graphColorForValues(data.filter(item => !hiddenLevels.includes(item.level)).map(item => item.value)));
        }
    }, [hiddenLevels]);

    const handleClick = (data: any) => {
        const level = data.level;
        if (hiddenLevels.includes(level)) {
            setHiddenLevels(hiddenLevels.filter(value => value != level));
        } else {
            setHiddenLevels([...hiddenLevels, level]);
        }
    };


    if (!props.levels) {
        return null;
    }

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
                        {formatDuration(averageTime * DAYS_MULTIPLIER)}
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
                            <YAxis
                                domain={[0, Math.ceil(maximumValueNotHidden(data, hiddenLevels) + 5)]}
                                allowDataOverflow={true}
                                label={{
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
                                labelFormatter={(value: any) => "Level " + value}/>
                            <ReferenceLine y={averageTime} ifOverflow="extendDomain" isFront={false}
                                           stroke={theme.palette.primary.light} strokeDasharray="5 4"
                                           strokeWidth={2}/>
                            <Bar dataKey="value" onClick={handleClick}>
                                <LabelList dataKey="value" content={<BarLabel/>}/>

                                {data.map((entry, index) => {
                                    return <Cell key={index}
                                                 fill={hiddenLevels.includes(entry.level) ? colors.unknown : graphColors[entry.value]}/>;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <Typography variant="body2" className={classes.explanationLabel}>
                        <i>Click on a level to exclude it from the graph and the average time calculation.</i>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    )
};
