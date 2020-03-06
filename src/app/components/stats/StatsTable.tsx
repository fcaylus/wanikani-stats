import React from "react";
import {Paper, Table, TableBody, TableCell, TableHead, TableRow, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Stats} from "../../../data/interfaces/stats";

const useStyles = makeStyles((theme: Theme) => ({
    table: {
        width: "fit-content",
        marginLeft: "auto",
        marginRight: "auto",
        overflowX: "auto",
        marginTop: theme.spacing(2)
    },
    cell: {
        padding: "2px 24px 2px 24px",
        [theme.breakpoints.down("md")]: {
            padding: "2px 14px 2px 14px",
        },
        [theme.breakpoints.down("sm")]: {
            padding: "2px 12px 2px 12px"
        },
        [theme.breakpoints.down("xs")]: {
            padding: "2px 2px 2px 2px"
        }
    }
}));

export interface StatsTableProps {
    stats?: Stats;
    currentUserLevel?: number;
}

/**
 * Table of WaniKani items repartition for different levels and other's source categories.
 */
const StatsTable = (props: StatsTableProps) => {
    const classes = useStyles();

    const formatPercentage = (levelIndex: number, categoryIndex: number): string => {
        if (!props.stats) {
            return "";
        }

        const percentage = props.stats.levels[levelIndex].categories[props.stats.categories[categoryIndex]] * 100;

        if (levelIndex != 0) {
            // If the previous percentage is 100%, return "-"
            if (props.stats.levels[levelIndex - 1].categories[props.stats.categories[categoryIndex]] == 1) {
                return "-";
            }
        }

        // Round to 0
        if (percentage < 0.05) {
            return "0 %";
        }
        return percentage.toFixed(1) + " %";
    };

    if (!props.stats) {
        return null;
    }

    return (
        <Paper elevation={5} className={classes.table}>
            <Table size="small" aria-label="stats table">
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.cell} align="center">Level</TableCell>
                        {props.stats.displayedCategories.map((category) => (
                            <TableCell key={category} className={classes.cell} align="center">{category}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.stats.levels.map((level, levelIndex) => {
                        const isSelected = props.currentUserLevel === parseInt(level.level);
                        return (
                            <TableRow key={level.level}
                                      selected={isSelected}
                                      hover={!isSelected}>
                                <TableCell className={classes.cell} align="center"
                                           variant="head" component="th">{level.level}</TableCell>
                                {props.stats && props.stats.categories.map((category, categoryIndex) => (
                                    <TableCell
                                        key={category} className={classes.cell}
                                        align="center">{formatPercentage(levelIndex, categoryIndex)}</TableCell>
                                ))}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default StatsTable;
