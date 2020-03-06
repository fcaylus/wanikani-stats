import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent, CardHeader, Divider} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {Tooltip} from "recharts";
import AdvancedResponsiveChart, {ChartData} from "../charts/AdvancedResponsiveChart";
import {ItemCategory} from "../../../data/interfaces/item";
import colors from "../../colors";
import {fastestTimeToLevel, NORMAL_LEVEL_DURATION, SRS_STAGES_DURATIONS} from "../../../data/common";

const useStyles = makeStyles(() => ({
    container: {
        overflow: "auto"
    }
}));

interface TimePoint {
    time: number;
    count: number;
}

/**
 * Generate "time points" of when reviews are needed to change the srs level as soon as possible
 */
const generateTimePoints = (categories: ItemCategory[]) => {
    const timePoints: TimePoint[] = [];
    for (const category of categories) {
        if (parseInt(category.category) <= 60) {
            // Add initial time point (for the initial lesson)
            const initialTime = fastestTimeToLevel(parseInt(category.category));
            timePoints.push({
                time: initialTime,
                count: category.items.length
            });

            // Add all the others SRS durations for all the reviews
            let time = initialTime;
            for (const duration of SRS_STAGES_DURATIONS) {
                time += duration;
                timePoints.push({
                    time: time,
                    count: category.items.length
                })
            }
        }
    }
    return timePoints;
};

/**
 * Merge the list of TimePoint by intervals of levelDuration and sum the counts
 */
const mergeTimePointsIntoLevels = (timePoints: TimePoint[]): number[] => {
    const sorted = timePoints.sort((a, b) => {
        return a.time < b.time ? -1 : (a.time > b.time ? 1 : 0);
    });

    let reviewsCount: number[] = [0];
    let index = 0;
    for (const timePoint of sorted) {
        // If levelDuration has spend, change the current index
        if (timePoint.time >= NORMAL_LEVEL_DURATION * (index + 1)) {
            index += 1;
            reviewsCount.push(0);
        }

        // Update the count
        reviewsCount[index] = reviewsCount[index] + timePoint.count;
    }
    return reviewsCount;
};

const generateChartData = (radicals: ItemCategory[],
                           kanjis: ItemCategory[],
                           vocabularies: ItemCategory[]): ChartData[] => {
    let data = [];

    const radicalsMergedCounts = mergeTimePointsIntoLevels(generateTimePoints(radicals));
    const kanjisMergedCounts = mergeTimePointsIntoLevels(generateTimePoints(kanjis));
    const vocabulariesMergedCounts = mergeTimePointsIntoLevels(generateTimePoints(vocabularies));

    // Find the max length
    const maxLength = Math.max(radicalsMergedCounts.length, kanjisMergedCounts.length, vocabulariesMergedCounts.length);
    for (let i = 0; i < maxLength; i++) {
        data.push({
            label: i + 1,
            radical: i < radicalsMergedCounts.length ? radicalsMergedCounts[i] : 0,
            kanji: i < kanjisMergedCounts.length ? kanjisMergedCounts[i] : 0,
            vocabulary: i < vocabulariesMergedCounts.length ? vocabulariesMergedCounts[i] : 0,
        })
    }

    return data;
};

interface ReviewsPerLevelChartProps {
    radicals?: ItemCategory[];
    kanjis?: ItemCategory[];
    vocabularies?: ItemCategory[];
}

/**
 * Display a graph of summed reviews per level (and beyond until everything is finished).
 * (This is only an estimation)
 */
export default function ReviewsPerLevelChart(props: ReviewsPerLevelChartProps) {
    const classes = useStyles();
    const [data, setData] = useState<ChartData[]>([]);

    useEffect(() => {
        if (props.radicals && props.kanjis && props.vocabularies) {
            setData(generateChartData(props.radicals, props.kanjis, props.vocabularies));
        }
    }, [props]);

    if (!props.radicals || !props.kanjis || !props.vocabularies) {
        return null;
    }

    return (
        <Card>
            <CardHeader title="Reviews per levels"/>
            <Divider/>
            <CardContent className={classes.container}>
                <AdvancedResponsiveChart
                    data={data}
                    type="area"
                    dataKeys={["radical", "kanji", "vocabulary"]}
                    colors={[colors.radical, colors.kanji, colors.vocabulary]}
                    xLabel="Levels / Weeks"
                    yLabel="Number of reviews"
                    minimalItemSize={5}
                    disableClick
                    hideLabels
                    footerText={"The graph assumes the maximum speed (6d20h/level) and sum the reviews to do per \"level duration\"."}
                >
                    <Tooltip
                        formatter={(value: any, name: string) => {
                            return [value, "Number of " + name + " reviews"]
                        }}
                        labelFormatter={(value: any) => (value <= 60 ? "Level " : "Week ") + value}/>
                </AdvancedResponsiveChart>
            </CardContent>
        </Card>
    )
};
