import {makeStyles} from "@material-ui/core/styles";
import {Card, CardContent, CardHeader, Divider} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {Tooltip} from "recharts";
import AdvancedResponsiveChart, {ChartData} from "../charts/AdvancedResponsiveChart";
import {ItemCategory} from "../../../data/interfaces/item";
import colors from "../../colors";

const useStyles = makeStyles(() => ({
    container: {
        overflow: "auto"
    }
}));

const generateChartData = (radicals: ItemCategory[],
                           kanjis: ItemCategory[],
                           vocabularies: ItemCategory[]): ChartData[] => {
    let data = [];

    for (let i = 0; i < radicals.length; i++) {
        if (parseInt(radicals[i].category) <= 60) {
            data.push({
                label: parseInt(radicals[i].category),
                radicals: radicals[i].items.length,
                kanjis: kanjis[i].items.length,
                vocabularies: vocabularies[i].items.length
            });
        }
    }

    return data;
};

export interface ItemsPerLevelChart {
    radicals?: ItemCategory[];
    kanjis?: ItemCategory[];
    vocabularies?: ItemCategory[];
}

/**
 * Display a "bar chart" of total wanikani items count per level
 */
export default function ItemsPerLevelChart(props: ItemsPerLevelChart) {
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
            <CardHeader title="Items per levels"/>
            <Divider/>
            <CardContent className={classes.container}>
                <AdvancedResponsiveChart
                    data={data}
                    type="bar"
                    dataKeys={["radicals", "kanjis", "vocabularies"]}
                    colors={[colors.radical, colors.kanji, colors.vocabulary]}
                    xLabel="Levels"
                    yLabel="Number of items"
                    minimalItemSize={5}
                    disableClick
                    hideLabels
                >
                    <Tooltip
                        formatter={(value: any, name: string) => {
                            return [value, "Number of " + name]
                        }}
                        labelFormatter={(value: any) => "Level " + value}/>
                </AdvancedResponsiveChart>
            </CardContent>
        </Card>
    )
};
