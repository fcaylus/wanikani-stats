import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import {Tab, Tabs} from "@material-ui/core";
import {useRouter} from "next/router";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {},
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            display: "none",
            [theme.breakpoints.up('sm')]: {
                display: "block",
            },
        },
        logo: {
            // TODO: use a computed value instead of "32px" ?
            maxHeight: "32px",
            marginRight: theme.spacing(2)
        },
        tabs: {
            marginLeft: "auto",
            minHeight: "inherit",
        },
        tabsFlexContainer: {
            height: "100%"
        }
    }),
);

/**
 * Header displayed on every page
 */
export default function PageHeader() {
    const classes = useStyles();
    const router = useRouter();

    // For /login, only display a minimal header
    const minimal = router.pathname == "/login";

    return (
        <header className={classes.root}>
            <AppBar position="fixed">
                <Toolbar>
                    {!minimal &&
                    <IconButton
                        edge="start"
                        className={classes.menuButton}
                        color="inherit"
                        aria-label="open drawer"
                    >
                        <MenuIcon/>
                    </IconButton>
                    }

                    <img src="/favicon-32x32.png" alt={process.env.appName} className={classes.logo}/>
                    <Typography className={classes.title} variant="h6" noWrap>
                        {process.env.appName}
                    </Typography>

                    {!minimal &&
                    <Tabs
                        value={"items"}
                        className={classes.tabs}
                        classes={{
                            flexContainer: classes.tabsFlexContainer
                        }}
                    >
                        <Tab value="items" label="Items"/>
                    </Tabs>
                    }
                </Toolbar>
            </AppBar>
        </header>
    );
}
