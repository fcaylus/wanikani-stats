import React, {useEffect, useState} from 'react';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {Box, CircularProgress, List, ListItem, Typography} from "@material-ui/core";
import ItemCard from "./ItemCard";
import {useDispatch, useSelector} from "react-redux";
import {ApiResultState} from "../redux/api/types";
import {RootState} from "../redux/store";
import {fetchApi} from "../redux/api/actions";
import {ProgressHashMap} from "../../server/interfaces/progress";
import {ItemCategory} from "../../data/interfaces/item";
import {getApiKey} from "../apiKey";

const useStyles = makeStyles((theme: Theme) => ({
    header: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
    },
    loadingUserProgress: {
        marginLeft: theme.spacing(1)
    },
    list: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap"
    },
    item: {
        width: "unset",
        margin: 2
    }
}));

/**
 * Grid list of a set of specified items
 */
export default function ItemList(props: ItemCategory) {
    // The data is saved as a state, so when the user progress is retrieved, it can be merge with the initial items
    const [userProgress, setUserProgress] = useState<ProgressHashMap>();
    const classes = useStyles();

    const dispatch = useDispatch();
    const progressApiLabel = "progress/" + props.itemsType;
    const progressResults: ApiResultState = useSelector((state: RootState) => {
        return state.api.results[progressApiLabel];
    });

    useEffect(() => {
        // Retrieve the user progress through the API, and update the list when done
        if (props.showUserProgress) {
            dispatch(fetchApi(progressApiLabel, "/api/progress", "GET", getApiKey(), {
                type: props.itemsType
            }));
        }
    }, [props.items, props.showUserProgress, props.itemsType]);

    useEffect(() => {
        // Check if progress is successfully retrieved and change datalist
        if (progressResults && progressResults.data && progressResults.data != userProgress && !progressResults.error) {
            setUserProgress(progressResults.data);
        }
    }, [progressResults, userProgress]);

    return (
        <Box>
            {props.headerText && (
                <Box className={classes.header}>
                    <Typography variant="h6">{props.headerText}</Typography>
                    {!userProgress && <CircularProgress size={16} className={classes.loadingUserProgress}/>}
                </Box>
            )}
            <List className={classes.list} dense={true} disablePadding={true}>
                {props.items.map((item, index) => {
                    return (
                        <ListItem className={classes.item} dense={true} disableGutters={true} key={index}>
                            <ItemCard {...item}
                                      srs={userProgress && userProgress[item.name] ? userProgress[item.name] : 0}/>
                        </ListItem>
                    );
                })}
            </List>
        </Box>

    );
}
