import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import {useRouter} from "next/router";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
        }
    }),
);

interface PageHeaderProps {
    toggleDrawer: () => any
}

/**
 * Header displayed on every page
 */
export default function PageHeader(props: PageHeaderProps) {
    const classes = useStyles();
    const router = useRouter();

    // For /login and /wait, only display a minimal header
    const minimal = router.pathname == "/login" || router.pathname == "/wait";

    return (
        <header className={classes.root}>
            <AppBar position="fixed">
                <Toolbar>
                    {!minimal && (
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
                </Toolbar>
            </AppBar>
        </header>
    );
}
