import {makeStyles, Theme} from "@material-ui/core/styles";
import {Box} from "@material-ui/core";
import React, {FunctionComponent, ReactElement} from "react";
import {ResponsiveContainer} from "recharts";
import theme from "../../theme";

const useStyles = makeStyles((theme: Theme) => ({
    box: {
        width: "100%"
    },
    content: {
        boxSizing: "border-box",
        marginBottom: theme.spacing(2),
        "& svg": {
            overflow: "visible"
        }
    }
}));

export const GRAPH_HEIGHT = 300;

/**
 * Props for ResponsiveChart
 */
export interface ResponsiveChartProps {
    header?: ReactElement;
    footer?: ReactElement;
    // minWidth prevents from having too small bars on small screens. The chart becomes then scrollable.
    minWidth: number;
}

/**
 * Encapsulate a recharts.js graph to make it responsive by setting the correct attributes and CSS classes.
 */
const ResponsiveChart: FunctionComponent<ResponsiveChartProps> = (props) => {
    const classes = useStyles();

    return (
        <Box className={classes.box} style={{minWidth: props.minWidth + theme.spacing(1) * 2}}>
            {props.header}
            <ResponsiveContainer height={GRAPH_HEIGHT} width={"99%"} minWidth={props.minWidth}
                                 className={classes.content}>
                {props.children}
            </ResponsiveContainer>
            {props.footer}
        </Box>
    )
};

export default ResponsiveChart;
