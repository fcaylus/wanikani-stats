import React from "react";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Card, CardContent, CardHeader, Divider, List, ListItem, Typography} from "@material-ui/core";
import moment from "moment";
import {ProgressItemsCount} from "../../../data/interfaces/progress";
import {colorForType, displayNameForType} from "../../types";
import {LevelsHashMap} from "../../../data/interfaces/level";
import {durationOfLevel} from "../../levels";
import formatDuration from "../../../formatDuration";
import {User} from "../../../data/interfaces/user";

const useStyles = makeStyles((theme: Theme) => ({
    list: {
        padding: 0,
        display: "flex",
        flexDirection: "column"
    },
    line: {
        display: "unset",
        alignItems: "baseline",
        "& > *:not(:first-child)": {
            marginLeft: theme.spacing(1),
        },
        "& > *:first-child": {
            fontWeight: "bold"
        },
        "& > *": {
            width: "fit-content"
        }
    }
}));

const formatDate = (date: any) => {
    return moment(date).format("LL")
        + " (" + moment.duration(moment(date).diff(moment(), "days"), "days").humanize(true)
        + ")";
};


interface StatusCardProps {
    user?: User;
    itemsCount?: ProgressItemsCount;
    levels?: LevelsHashMap;
    averageTime?: number;
}

/**
 * Card containing general information about the user's progress
 */
export default function StatusCard(props: StatusCardProps) {
    const classes = useStyles();

    if (!props.user) {
        return null;
    }

    return (
        <Card>
            <CardHeader title="Summary"/>
            <Divider/>
            <CardContent>
                <List dense className={classes.list}>
                    <React.Fragment>
                        <ListItem className={classes.line} disableGutters>
                            <Typography variant="body1" component="span">Level:</Typography>
                            <Typography variant="body1" component="span">{props.user.currentLevel}</Typography>
                        </ListItem>
                        {props.levels && props.averageTime && (
                            <React.Fragment>
                                <ListItem className={classes.line} disableGutters>
                                    <Typography variant="body1" component="span">Time on level:</Typography>
                                    <Typography variant="body1" component="span">
                                        {formatDuration(durationOfLevel(props.levels[props.user.currentLevel]))}
                                    </Typography>
                                </ListItem>
                                <ListItem className={classes.line} disableGutters>
                                    <Typography variant="body1" component="span">Expected level-up in:</Typography>
                                    <Typography variant="body1" component="span">
                                        {formatDuration(Math.max(0,
                                            props.averageTime
                                            - durationOfLevel(props.levels[props.user.currentLevel])))}
                                    </Typography>
                                </ListItem>
                                <ListItem className={classes.line} disableGutters>
                                    <Typography variant="body1" component="span">
                                        Average time on levels:
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                        {formatDuration(props.averageTime)}
                                    </Typography>
                                </ListItem>
                            </React.Fragment>
                        )}
                    </React.Fragment>
                    <ListItem className={classes.line} disableGutters>
                        <Typography variant="body1" component="span">Start date:</Typography>
                        <Typography variant="body1" component="span">
                            {formatDate(props.user.startDate)}
                        </Typography>
                    </ListItem>
                    {props.itemsCount && props.itemsCount.type && (
                        <ListItem className={classes.line} disableGutters>
                            <Typography variant="body1" component="span">Items learned:</Typography>
                            {Object.keys(props.itemsCount.type).map((itemType) => {
                                if (!props.itemsCount || !props.itemsCount.type) {
                                    return null;
                                }
                                return (
                                    <Typography key={itemType} variant="body1" component="span" style={{
                                        color: colorForType(itemType)
                                    }}>
                                        {props.itemsCount.type[itemType] + " " + displayNameForType(itemType)}
                                    </Typography>
                                );
                            })}
                        </ListItem>
                    )}
                </List>
            </CardContent>
        </Card>
    );
}
