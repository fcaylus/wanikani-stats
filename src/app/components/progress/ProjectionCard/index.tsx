import React, {useEffect, useState} from "react";
import {makeStyles, Theme, useTheme} from "@material-ui/core/styles";
import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    Divider,
    IconButton,
    Toolbar,
    Typography,
    useMediaQuery
} from "@material-ui/core";
import {LevelsHashMap} from "../../../../data/interfaces/level";
import ReversedVerticalSlider from "../../ReversedVerticalSlider";
import ProjectionTable from "./ProjectonTable";
import LevelCategories from "./LevelCategories";
import SpeedSelector from "./SpeedSelector";
import CloseIcon from '@material-ui/icons/Close';
import {User} from "../../../../data/interfaces/user";

const dialogThreshold = 500;

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column"
    },
    cardContent: {
        overflowX: "auto",
    },
    content: {
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
    },
    slider: {
        marginRight: `${theme.spacing(10)}px !important`,
        [theme.breakpoints.down("md")]: {
            marginRight: `${theme.spacing(7)}px !important`,
        },
    },
    tableContainer: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        [theme.breakpoints.down(dialogThreshold)]: {
            overflowX: "auto"
        }
    },
    sliderContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        [theme.breakpoints.down(dialogThreshold)]: {
            height: "80%",
            margin: "auto"
        }
    },
    dialogAppBar: {
        position: "relative",
    },
    dialogTitle: {
        marginLeft: theme.spacing(2),
        flexGrow: 1
    }
}));

const sliderMarks = [
    {
        value: 1,
        label: "Level 1"
    },
    {
        value: 10,
    },
    {
        value: 20,
    },
    {
        value: 30,
        label: "Level 30"
    },
    {
        value: 40,
    },
    {
        value: 50,
    },
    {
        value: 60,
        label: "Level 60"
    }
];

export interface ProjectionCardProps {
    levels?: LevelsHashMap;
    user?: User;
    averageTime?: number;
}

/**
 * Card containing the level up time projections on the user.
 */
export default function ProjectionCard(props: ProjectionCardProps) {
    const classes = useStyles();
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down(dialogThreshold));

    const [selectedLevel, setSelectedLevel] = useState(1);
    const [customSpeedDays, setCustomSpeedDays] = useState(7);
    const [customSpeedHours, setCustomSpeedHours] = useState(0);

    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (props.user) {
            setSelectedLevel(props.user.currentLevel);
        }
    }, [props.user]);

    const handleSliderChange = (_event: any, value: any) => {
        if (value != selectedLevel) {
            setSelectedLevel(value);
        }
    };

    const handleTableClick = (level: number) => {
        setSelectedLevel(level);
    };

    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    if (!props.levels || !props.user || !props.averageTime) {
        return null;
    }

    return (
        <Card className={classes.root}>
            <CardHeader title="Level-up projections"/>
            <Divider/>
            <CardContent className={classes.cardContent}>
                <Box className={classes.content}>
                    {!mobile && (
                        <Box className={classes.sliderContainer}>
                            <LevelCategories/>
                            <ReversedVerticalSlider
                                className={classes.slider}
                                getAriaValueText={value => `Level ${value}`}
                                step={1}
                                min={1}
                                max={60}
                                marks={sliderMarks}
                                valueLabelDisplay="on"
                                value={selectedLevel}
                                onChange={handleSliderChange}/>
                        </Box>
                    )}
                    <Box className={classes.tableContainer}>
                        {mobile && (
                            <Button onClick={handleDialogOpen} variant="contained">
                                Select a level
                            </Button>
                        )}
                        <SpeedSelector valueDays={customSpeedDays}
                                       valueHours={customSpeedHours}
                                       onChangeDays={setCustomSpeedDays}
                                       onChangeHours={setCustomSpeedHours}/>
                        <ProjectionTable levels={props.levels}
                                         user={props.user}
                                         averageTime={props.averageTime}
                                         additionalLevel={selectedLevel}
                                         targetSpeed={customSpeedDays * 24 + customSpeedHours}
                                         onRowClick={handleTableClick}/>
                    </Box>
                </Box>
                {mobile && (
                    <Dialog fullScreen open={dialogOpen} onClose={handleDialogClose}>
                        <AppBar className={classes.dialogAppBar}>
                            <Toolbar>
                                <IconButton edge="start" color="inherit" onClick={handleDialogClose} aria-label="close">
                                    <CloseIcon/>
                                </IconButton>
                                <Typography variant="h6" className={classes.dialogTitle}>
                                    Select a level
                                </Typography>
                                <Button autoFocus color="inherit" onClick={handleDialogClose}>
                                    OK
                                </Button>
                            </Toolbar>
                        </AppBar>
                        <Box className={classes.sliderContainer}>
                            <LevelCategories/>
                            <ReversedVerticalSlider
                                className={classes.slider}
                                getAriaValueText={value => `Level ${value}`}
                                step={1}
                                min={1}
                                max={60}
                                marks={sliderMarks}
                                valueLabelDisplay="on"
                                value={selectedLevel}
                                onChange={handleSliderChange}/>
                        </Box>
                    </Dialog>
                )}
            </CardContent>
        </Card>
    );
}
