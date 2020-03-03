import React from 'react';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {
    Card,
    CardContent,
    CardHeader,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@material-ui/core";
import {Accuracy} from "../../../data/interfaces/accuracy";
import capitalize from "../../../capitalize";
import {itemTypes} from "../../../data/data";
import {colorForType, displayNameForType} from "../../types";

const useStyles = makeStyles((theme: Theme) => ({
    table: {
        overflowX: "auto",
    },
    cell: {
        padding: "3px 16px 3px 16px",
        [theme.breakpoints.down("md")]: {
            padding: "2px 14px 2px 14px",
        },
        [theme.breakpoints.down("sm")]: {
            padding: "2px 12px 2px 12px"
        },
        [theme.breakpoints.down("xs")]: {
            padding: "2px 2px 2px 2px"
        }
    },
    tableBody: {
        // Remove the bottom border of the last row
        "& > *:last-child > *": {
            borderBottom: "unset"
        }
    }
}));

interface AccuracyCardProps {
    accuracy?: Accuracy;
}

const propertyLookup = ["correct", "incorrect", "total"];
const accuracyTypeLookup = ["meaning", "reading", "total"];

/**
 * Table of the accuracy data of the user
 */
export default function AccuracyCard(props: AccuracyCardProps) {
    const classes = useStyles();

    // Get the accuracy count for all type of items
    const getAccuracyData = (itemType: string, countCategory: string, type: string): number => {
        if (type == "total") {
            return getAccuracyData(itemType, countCategory, "meaning") + getAccuracyData(itemType, countCategory, "reading")
        }

        if (!props.accuracy) {
            return 0;
        }

        if (itemType == "sum") {
            let sum = 0;
            for (const itemType of itemTypes()) {
                sum += props.accuracy[itemType][countCategory][type];
            }
            return sum;
        }

        return props.accuracy[itemType][countCategory][type];
    };

    // Format percentages
    const getPercentage = (itemType: string, accuracyType: string) => {
        if (!props.accuracy) {
            return "-";
        }

        if (itemType == "radical" && accuracyType == "reading") {
            return "-";
        }

        return (getAccuracyData(itemType, "correct", accuracyType) / getAccuracyData(itemType, "total", accuracyType) * 100).toFixed(2) + " %";
    };

    // Do not show if there is no data
    if (!props.accuracy) {
        return null;
    }

    return (
        <Card>
            <CardHeader title={"Accuracy"}/>
            <Divider/>
            <CardContent className={classes.table}>
                {props.accuracy && (
                    <Table size="small" aria-label="Accuracy table">
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.cell}/>
                                {accuracyTypeLookup.map((accuracyType) => (
                                    <TableCell key={accuracyType} className={classes.cell}
                                               align="center">{capitalize(accuracyType)}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody className={classes.tableBody}>
                            {propertyLookup.map((propertyType) => (
                                <TableRow key={propertyType} hover>
                                    <TableCell className={classes.cell} align="right"
                                               variant="head">{capitalize(propertyType)}</TableCell>
                                    {accuracyTypeLookup.map((accuracyType) => (
                                        <TableCell key={accuracyType} className={classes.cell}
                                                   align="center">{getAccuracyData("sum", propertyType, accuracyType)}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                            <TableRow hover>
                                <TableCell className={classes.cell} variant="head" align="right">Accuracy</TableCell>
                                {accuracyTypeLookup.map((accuracyType) => (
                                    <TableCell key={accuracyType} className={classes.cell}
                                               align="center"
                                               variant="head">{getPercentage("sum", accuracyType)}</TableCell>
                                ))}
                            </TableRow>
                            {itemTypes().map((itemType) => (
                                <TableRow key={itemType} hover>
                                    <TableCell className={classes.cell} align="right"
                                               variant="head">{displayNameForType(itemType)}</TableCell>
                                    {accuracyTypeLookup.map((accuracyType) => (
                                        <TableCell key={accuracyType} className={classes.cell}
                                                   align="center" variant="head"
                                                   style={{color: colorForType(itemType)}}>{getPercentage(itemType, accuracyType)}</TableCell>
                                    ))}
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
