import React, {useEffect, useState} from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {fastestLevelDuration, fastestTimeToLevel, isLevelOfInterest, LEVELS_OF_INTEREST} from "../../../../data/common";
import {ProjectionCardProps} from "./index";
import moment from "moment";
import compareNumbers from "../../../../compareNumbers";
import {averageLevelDuration, durationOfLevel} from "../../../levels";

const HOURS_TO_MS = 60 * 60 * 1000;

const useStyles = makeStyles((theme: Theme) => ({
    cell: {
        whiteSpace: "nowrap",
        padding: "3px 16px 3px 16px",
        [theme.breakpoints.down("md")]: {
            padding: "2px 4px 2px 4px"
        },
        [theme.breakpoints.down("xs")]: {
            padding: "2px 2px 2px 2px"
        },
        [theme.breakpoints.down(800)]: {
            fontSize: "0.8rem"
        }
    },
    row: {
        cursor: "pointer"
    },
    tableBody: {
        // Remove the bottom border of the last row
        "& > *:last-child > *": {
            borderBottom: "unset"
        }
    }
}));

interface ProjectionTableProps extends Required<ProjectionCardProps> {
    className?: string;
    additionalLevel: number;
    onRowClick: (level: number) => void;
    targetSpeed: number;
}

/**
 * Table of time projections. Contains three columns, with each a different way of predicting the time.
 */
export default function ProjectionTable(props: ProjectionTableProps) {
    const classes = useStyles();

    const [averageTime, setAverageTime] = useState<number>(0);
    const [currentLevelTime, setCurrentLevelTime] = useState<number>(0);
    const [fastestCurrentLevelTime, setFastestCurrentLevelTime] = useState<number>(0);
    const [targetCurrentLevelTime, setTargetCurrentLevelTime] = useState<number>(0);
    const [displayedLevelsList, setDisplayedLevelsList] = useState<any[]>([]);

    /**
     * Update the average time and the time needed to finish the current level
     */
    useEffect(() => {
        const average = averageLevelDuration(Object.values(props.levels)) / HOURS_TO_MS;
        setAverageTime(average);
        setCurrentLevelTime(Math.max(0, average - durationOfLevel(props.levels[props.user.currentLevel]) / HOURS_TO_MS));
        setFastestCurrentLevelTime(Math.max(0, fastestLevelDuration(props.user.currentLevel) - durationOfLevel(props.levels[props.user.currentLevel]) / HOURS_TO_MS));
    }, [props.levels]);

    useEffect(() => {
        setTargetCurrentLevelTime(Math.max(0, props.targetSpeed - durationOfLevel(props.levels[props.user.currentLevel]) / HOURS_TO_MS));
    }, [props.levels, props.targetSpeed]);

    /**
     * Update the list of levels displayed when the additionalData change
     */
    useEffect(() => {
        // Append the current level to the list
        let levels = LEVELS_OF_INTEREST.slice();
        levels.push({
            level: props.user.currentLevel,
            label: "Current level"
        });

        // Append the additional level (if not already inside)
        if (!isLevelOfInterest(props.additionalLevel) && props.additionalLevel != props.user.currentLevel) {

        }
        levels.push({
            level: props.additionalLevel,
            label: "Level " + props.additionalLevel
        });

        levels = levels.sort((a, b) => {
            return compareNumbers(a.level, b.level);
        });
        setDisplayedLevelsList(levels);
    }, [props.user, props.additionalLevel]);

    /**
     * Format a duration in hours by adding it to the start date
     */
    const formatDate = (start: Date | undefined, duration: number) => {
        if (!start) {
            return "???";
        }
        return moment(start).add(duration, "hours").format("L H:m");
    };

    const renderEstimatedTime = (level: number) => {
        if (level < props.user.currentLevel) {
            return formatDate(props.levels[level].passDate, 0);
        } else if (level == props.user.currentLevel) {
            return formatDate(new Date(), currentLevelTime);
        } else {
            return formatDate(new Date(), currentLevelTime + (averageTime * (level - props.user.currentLevel)))
        }
    };

    const renderFastestTime = (level: number) => {
        if (level < props.user.currentLevel) {
            return "-";
        } else if (level == props.user.currentLevel) {
            return formatDate(new Date(), fastestCurrentLevelTime);
        } else {
            return formatDate(new Date(), fastestCurrentLevelTime
                + fastestTimeToLevel(level)
                - fastestTimeToLevel(props.user.currentLevel)
                + fastestLevelDuration(level))
        }
    };

    const renderTargetTime = (level: number) => {
        if (level < props.user.currentLevel) {
            return "-";
        } else if (level == props.user.currentLevel) {
            return formatDate(new Date(), targetCurrentLevelTime);
        } else {
            return formatDate(new Date(), targetCurrentLevelTime + (props.targetSpeed * (level - props.user.currentLevel)));
        }
    };

    return (
        <TableContainer className={props.className}>
            <Table size="small" aria-label="Levels projection table">
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.cell}/>
                        <TableCell className={classes.cell} align="center">Estimated</TableCell>
                        <TableCell className={classes.cell} align="center">Fastest</TableCell>
                        <TableCell className={classes.cell} align="center">Target</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody className={classes.tableBody}>
                    {displayedLevelsList.map((level, index) => (
                        <TableRow key={index}
                                  hover
                                  selected={level.level == props.additionalLevel}
                                  onClick={() => props.onRowClick(level.level)}
                                  className={classes.row}>
                            <TableCell className={classes.cell}
                                       variant={level.level == props.user.currentLevel ? "head" : "body"}>
                                <b>{level.level.toString() + " - "}</b>
                                {level.label}
                            </TableCell>
                            <TableCell className={classes.cell}
                                       align="center"
                                       variant={level.level == props.user.currentLevel ? "head" : "body"}>
                                {renderEstimatedTime(level.level)}
                            </TableCell>
                            <TableCell className={classes.cell}
                                       align="center"
                                       variant={level.level == props.user.currentLevel ? "head" : "body"}>
                                {renderFastestTime(level.level)}
                            </TableCell>
                            <TableCell className={classes.cell}
                                       align="center"
                                       variant={level.level == props.user.currentLevel ? "head" : "body"}>
                                {renderTargetTime(level.level)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
