import React from 'react';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {Typography} from "@material-ui/core";
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
        marginBottom: 4
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
            <div className={classes.list}>
                {props.items.map((item, index) => {
                    const progress = props.progress ? props.progress[item.name] : undefined;
                    return (
                        <ItemCard {...item}
                                  srs={props.progress && progress ? progress : 0}
                                  className={classes.item} key={index}/>
                    );
                })}
            </div>
        </React.Fragment>

    );
});
