import React from 'react';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {List, ListItem, Typography} from "@material-ui/core";
import ItemCard from "./ItemCard";
import {ProgressHashMap} from "../../server/interfaces/progress";
import {ItemCategory} from "../../data/interfaces/item";

const useStyles = makeStyles((theme: Theme) => ({
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
        marginRight: 4,
        paddingTop: 2,
        paddingBottom: 2
    }
}));

/**
 * Grid list of a set of specified items
 */
export default React.memo((props: ItemCategory & { progress?: ProgressHashMap }) => {
    const classes = useStyles();

    return (
        <React.Fragment>
            {props.headerText && (
                <Typography variant="h6">{props.headerText}</Typography>
            )}
            <List className={classes.list} dense disablePadding>
                {props.items.map((item, index) => {
                    return (
                        <ListItem className={classes.item} dense disableGutters key={index}>
                            <ItemCard {...item}
                                      srs={props.progress && props.progress[item.name] ? props.progress[item.name] : 0}/>
                        </ListItem>
                    );
                })}
            </List>
        </React.Fragment>

    );
});
