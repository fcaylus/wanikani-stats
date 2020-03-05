import React from 'react';
import {makeStyles, Theme} from '@material-ui/core/styles';
import {Box, Divider, Drawer, Hidden, IconButton, List, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ShowChartIcon from "@material-ui/icons/ShowChart";
import HomeIcon from "@material-ui/icons/Home";
import TranslateIcon from '@material-ui/icons/Translate';
import {useRouter} from "next/router";
import {DEFAULT_REDIRECT_URL} from "../../../redirect";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) => ({
    offset: theme.mixins.toolbar,
    drawer: {
        [theme.breakpoints.up("md")]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerCollapse: {
        ...theme.mixins.toolbar,
        display: "flex",
        flexDirection: "row-reverse"
    }
}));

interface PageNavProps {
    toggleDrawer: () => any
    mobileOpen: boolean
}

const routes = [
    {
        name: "Home",
        icon: <HomeIcon/>,
        url: DEFAULT_REDIRECT_URL,
        as: DEFAULT_REDIRECT_URL,
        isSame: (url: string) => {
            return url == "/" || url == "";
        }
    },
    {
        name: "Items",
        icon: <TranslateIcon/>,
        url: "/items/[item_type]/[source]",
        as: "/items/kanji/wanikani",
        isSame: (url: string) => {
            return url.startsWith("/items");
        }
    },
    {
        name: "Stats",
        icon: <ShowChartIcon/>,
        url: "/stats/[item_type]/[source]",
        as: "/stats/kanji/jlpt",
        isSame: (url: string) => {
            return url.startsWith("/stats");
        }
    }
];

/**
 * Navigation drawer displayed on every page
 */
export default function PageNav(props: PageNavProps) {
    const classes = useStyles();
    const router = useRouter();

    // Handle drawer item click
    const navClick = (route: any) => {
        if (!route.isSame(router.pathname)) {
            router.push(route.url, route.as, {
                shallow: true
            });
            props.toggleDrawer();
        }
    };

    // Main content of the drawer
    const drawer = (permanent: boolean) => {
        return (
            <Box>
                {permanent && <div className={classes.offset}/>}
                {!permanent && (
                    <Box className={classes.drawerCollapse}>
                        <IconButton onClick={props.toggleDrawer}>
                            <ChevronLeftIcon/>
                        </IconButton>
                    </Box>
                )}
                <Divider/>
                <List>
                    {routes.map((route) => {
                        return (
                            <ListItem button key={route.name} onClick={() => navClick(route)}
                                      selected={route.isSame(router.pathname)}>
                                <ListItemIcon>{route.icon}</ListItemIcon>
                                <ListItemText primary={route.name}/>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        );
    };

    return (
        <nav className={classes.drawer} aria-label="pages">
            {/* Drawer displayed on mobile */}
            <Hidden mdUp implementation="js">
                <Drawer
                    variant="temporary"
                    anchor="left"
                    open={props.mobileOpen}
                    onClose={props.toggleDrawer}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                >
                    {drawer(false)}
                </Drawer>
            </Hidden>
            <Hidden smDown implementation="js">
                {/* Drawer displayed on desktop */}
                <Drawer
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    variant="permanent"
                    open
                >
                    {drawer(true)}
                </Drawer>
            </Hidden>
        </nav>
    );
}
