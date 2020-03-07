import React, {useEffect, useState} from "react";
import PageContent from "../src/app/components/page/PageContent";
import {Button, Link, Paper, TextField, Theme, Typography, useMediaQuery} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import isUUID from "../src/isUUID";
import {useDispatch} from "react-redux";
import {useRouter} from "next/router";
import {saveApiKey} from "../src/app/apiKey";
import redirect, {DEFAULT_REDIRECT_URL} from "../src/redirect";
import {isResultError, isResultSuccessful, useLoginSelector} from "../src/app/redux/api/selectors";
import {fetchLogin} from "../src/app/redux/api/requests";
import useTheme from "@material-ui/core/styles/useTheme";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        "& > *": {
            margin: theme.spacing(2)
        }
    },
    container: {
        width: "fit-content",
        maxWidth: "100%",
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
    },
    showcase: {
        objectFit: "contain",
        maxWidth: 600
    }
}));

/**
 * Login page. If login is successful, store the api token with cookies
 */
function LoginPage() {
    const classes = useStyles();
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down("xs"));

    const dispatch = useDispatch();
    const router = useRouter();
    const [inputError, setInputError] = useState(false);
    const [token, setToken] = useState("");

    const loginResult = useLoginSelector();

    useEffect(() => {
        if (isResultSuccessful(loginResult)) {
            // Successfully logged in
            saveApiKey(token);
            redirect(router.query.redirect ? decodeURI(router.query.redirect.toString()) : DEFAULT_REDIRECT_URL);
        }

        if (isResultError(loginResult)) {
            setInputError(true);

        }
    }, [loginResult]);

    const handleClick = () => {
        if (token) {
            if (!isUUID(token)) {
                setInputError(true);
                return;
            }

            // Login
            dispatch(fetchLogin(token));
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
                    <Link target="_blank" rel="noopener"
                          href="https://www.wanikani.com/settings/personal_access_tokens">
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

            {!mobile && (
                <Paper elevation={5} className={classes.container}>
                    <Typography variant="h6">
                        Demo
                    </Typography>
                    <img decoding="async" src="/showcase.gif" alt={process.env.appName + " showcase"}
                         className={classes.showcase}/>
                </Paper>
            )}
        </PageContent>
    );
}

export default LoginPage;
