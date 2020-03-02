import React from 'react';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {Status} from "../../../data/interfaces/status";
import {Card, CardContent, CardHeader, Divider, List, ListItem, Typography} from "@material-ui/core";
import clsx from "clsx";
import moment from "moment";
import {ProgressItemsCount} from "../../../data/interfaces/progress";
import {colorForType, displayNameForType} from "../../types";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        minWidth: 300,
        [theme.breakpoints.down(400)]: {
            minWidth: "unset"
        }
    },
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

interface StatusCardProps {
    status?: Status;
    itemsCount?: ProgressItemsCount;
    className?: any;
}

/**
 * Card containing general information about the user's progress
 */
export default function StatusCard(props: StatusCardProps) {
    const classes = useStyles();

    const formatDate = (date: any) => {
        return moment(date).format("LL")
            + " (" + moment.duration(moment(date).diff(moment(), "days"), "days").humanize(true)
            + ")";
    };

    return (
        <Card className={clsx(classes.root, props.className)}>
            <CardHeader title={"Summary"}/>
            <Divider/>
            <CardContent>
                <List dense className={classes.list}>
                    {props.status && props.status.currentLevel && (
                        <ListItem className={classes.line} disableGutters>
                            <Typography variant="body1" component="span">Level:</Typography>
                            <Typography variant="body1" component="span">{props.status.currentLevel}</Typography>
                        </ListItem>
                    )}
                    {props.status && props.status.startDate && (
                        <ListItem className={classes.line} disableGutters>
                            <Typography variant="body1" component="span">Start date:</Typography>
                            <Typography variant="body1" component="span">
                                {formatDate(props.status.startDate)}
                            </Typography>
                        </ListItem>
                    )}
                    {props.itemsCount && props.itemsCount.type && (
                        <ListItem className={classes.line} disableGutters>
                            <Typography variant="body1" component="span">Items learned:</Typography>
                            {Object.keys(props.itemsCount.type).map((itemType) => {
                                if (!props.itemsCount || !props.itemsCount.type) {
                                    return null;
                                }
                                return (
                                    <Typography variant="body1" component="span" style={{
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
