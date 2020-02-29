import React, {useState} from 'react';
import PageContent from "../src/app/components/PageContent";
import {Button, Link, Paper, TextField, Theme, Typography} from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import isUUID from "../src/isUUID";
import {useDispatch, useSelector} from "react-redux";
import {fetchApi} from "../src/app/redux/api/actions";
import {ApiResultState} from "../src/app/redux/api/types";
import {RootState} from "../src/app/redux/store";
import {useRouter} from "next/router";
import {saveApiKey} from "../src/app/apiKey";
import redirect, {DEFAULT_REDIRECT_URL} from "../src/redirect";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "& > *": {
            margin: theme.spacing(2)
        }
    },
    container: {
        width: "fit-content",
        padding: theme.spacing(2),
        paddingBottom: 0,
        display: "flex",
        flexDirection: "column",
        "& > *": {
            marginBottom: theme.spacing(2)
        }
    },
    loginButton: {
        marginLeft: "auto"
    },
    image: {
        maxWidth: 100,
        maxHeight: 100,
        objectFit: "contain"
    }
}));

/**
 * Login page. If login is successful, store the api token with cookies
 */
function LoginPage() {
    const classes = useStyles();

    const dispatch = useDispatch();
    const router = useRouter();
    const [inputError, setInputError] = useState(false);
    const [token, setToken] = useState("");

    const loginResult: ApiResultState = useSelector((state: RootState) => {
        return state.api.results["login"];
    });

    if (loginResult && !loginResult.fetching && !loginResult.error) {
        // Successfully logged in
        saveApiKey(token);
        redirect(router.query.redirect ? decodeURI(router.query.redirect.toString()) : DEFAULT_REDIRECT_URL)
    }

    if (loginResult && !loginResult.fetching && loginResult.error) {
        setInputError(true);
    }

    const handleClick = () => {
        if (token) {
            if (!isUUID(token)) {
                setInputError(true);
                return;
            }

            // Login
            dispatch(fetchApi("login", "/api/login", "GET", token, undefined, false, true));
            return;
        }

        setInputError(true);
        return;
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setToken(event.target.value);
    };

    return (
        <PageContent pageTitle="Login" className={classes.root}>
            <img src={"/android-chrome-192x192.png"} alt={process.env.appName + " logo"} className={classes.image}/>
            <Typography variant="h4" component="h1" gutterBottom>
                {process.env.appName}
            </Typography>
            <Paper elevation={5} className={classes.container}>
                <Typography variant="h6">
                    Please enter your API (V2) access token
                </Typography>
                <Typography variant="body2">
                    You don't know what it is ? Click&nbsp;
                    <Link target="_blank" href="https://www.wanikani.com/settings/personal_access_tokens">
                        here
                    </Link>
                    .
                </Typography>
                <TextField required fullWidth autoFocus error={inputError} label="Access token"
                           variant={"outlined"} id="input-access-token"
                           value={token} onChange={handleChange}
                           disabled={loginResult && loginResult.fetching}/>
                <Button variant="contained" color="primary" className={classes.loginButton}
                        disabled={loginResult && loginResult.fetching}
                        onClick={handleClick}>
                    Login
                </Button>
            </Paper>
        </PageContent>
    );
}

export default LoginPage;
