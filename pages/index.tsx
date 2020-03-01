import React, {useEffect} from 'react';
import PageContent from "../src/app/components/PageContent";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../src/app/redux/store";
import {ApiResultState} from "../src/app/redux/api/types";
import {fetchApi} from "../src/app/redux/api/actions";
import {getApiKey} from "../src/app/apiKey";
import StatusCard from "../src/app/components/StatusCard";

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "& > *": {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2)
        }
    },
    image: {
        maxWidth: 100,
        maxHeight: 100,
        objectFit: "contain"
    }
}));

// TODO: add server side rendering to prefetch API data
export default function Index() {
    const classes = useStyles();

    const dispatch = useDispatch();
    const statusResult: ApiResultState = useSelector((state: RootState) => {
        return state.api.results["status"];
    });

    useEffect(() => {
        dispatch(fetchApi("status", "/api/user/status", "GET", getApiKey()));
    }, []);

    return (
        <PageContent className={classes.root} showProgress={!statusResult || statusResult.fetching}>
            <img src={"/android-chrome-192x192.png"} alt={process.env.appName + " logo"} className={classes.image}/>
            <StatusCard
                status={statusResult && !statusResult.fetching && !statusResult.error ? statusResult.data : undefined}/>
        </PageContent>
    );
}
