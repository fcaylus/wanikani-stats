import React, {useEffect, useState} from 'react';
import {makeStyles, Theme} from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import LaunchIcon from '@material-ui/icons/Launch';
import {useDispatch} from "react-redux";
import {removeApiKey} from "../../apiKey";
import {AppBar, Button, Divider, IconButton, Menu, MenuItem, Toolbar, Typography} from "@material-ui/core";
import colors from "../../colors";
import redirect from "../../../redirect";
import {User} from "../../../data/interfaces/user";
import {useUserSelector} from "../../redux/api/selectors";
import {fetchLogout, fetchUser} from "../../redux/api/requests";
import {purgeStorage} from "../../redux/api/storage";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        zIndex: theme.zIndex.drawer + 1
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up("md")]: {
            display: "none"
        }
    },
    title: {},
    logo: {
        maxHeight: 32,
        marginRight: theme.spacing(2),
        display: "none",
        [theme.breakpoints.up("sm")]: {
            display: "block"
        }
    },
    user: {
        marginLeft: "auto",
        fontWeight: "bold",
        textTransform: "unset",
        color: colors.white
    },
    icon: {
        marginLeft: theme.spacing(1)
    }
}));

interface PageHeaderProps {
    toggleDrawer: () => any,
    minimal: boolean
}

/**
 * Header displayed on every page
 */
export default function PageHeader(props: PageHeaderProps) {
    const classes = useStyles();
    const dispatch = useDispatch();

    const userResult = useUserSelector();
    const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | undefined>(undefined);

    const handleUserMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setUserMenuAnchor(event.currentTarget);
    };
    const handleUserMenuClose = () => {
        setUserMenuAnchor(undefined);
    };

    const logout = () => {
        dispatch(fetchLogout());
        removeApiKey();
        redirect("/login");
    };

    const purge = () => {
        purgeStorage().then(() => redirect("/"));
    };

    useEffect(() => {
        // Only retrieve user when we are not on a "minimal" page
        if (!props.minimal) {
            dispatch(fetchUser());
        }
    }, []);

    return (
        <header className={classes.root}>
            <AppBar position="fixed">
                <Toolbar>
                    {!props.minimal && (
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="open drawer"
                            onClick={props.toggleDrawer}
                        >
                            <MenuIcon/>
                        </IconButton>
                    )}

                    <img src="/favicon-32x32.png" alt={process.env.appName} className={classes.logo}/>
                    <Typography className={classes.title} variant="h6" noWrap>
                        {process.env.appName}
                    </Typography>

                    {!props.minimal && userResult && !userResult.error && !userResult.fetching && (
                        <React.Fragment>
                            <Button aria-controls="user-menu" aria-haspopup={true} onClick={handleUserMenuClick}
                                    className={classes.user}>
                                {(userResult.data as User).username}
                            </Button>
                            <Menu
                                id="user-menu"
                                anchorEl={userMenuAnchor}
                                keepMounted
                                open={!!userMenuAnchor}
                                onClose={handleUserMenuClose}
                            >
                                <MenuItem onClick={() => {
                                    window.open((userResult.data as User).profileUrl, "_blank");
                                    handleUserMenuClose();
                                }}>
                                    WaniKani Profile
                                    <LaunchIcon className={classes.icon} fontSize="small"/>
                                </MenuItem>
                                <MenuItem onClick={logout}>Logout</MenuItem>
                                <Divider/>
                                <MenuItem onClick={purge}>Purge local cache</MenuItem>
                            </Menu>
                        </React.Fragment>
                    )}
                </Toolbar>
            </AppBar>
        </header>
    );
}
