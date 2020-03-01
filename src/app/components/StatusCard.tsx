import React from 'react';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {Status} from "../../data/interfaces/status";
import {Card, CardContent, CardHeader, Divider, LinearProgress, List, ListItem, Typography} from "@material-ui/core";
import clsx from "clsx";
import moment from "moment";

const useStyles = makeStyles((theme: Theme) => ({
    root: {},
    list: {
        padding: 0,
        display: "flex",
        flexDirection: "column"
    },
    line: {
        display: "unset",
        alignItems: "baseline",
        "& > *:last-child": {
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
    className?: any;
}

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
            {!props.status && (
                <LinearProgress/>
            )}
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
                </List>
            </CardContent>
        </Card>
    );
}
