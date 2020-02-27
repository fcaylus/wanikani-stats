import {createMuiTheme} from '@material-ui/core/styles';

/**
 * Theme for the main app.
 * TODO: change the theme
 */
const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#8e24aa",
            light: "#c158dc",
            dark: "#5c007a",
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#ffb300",
            light: "#ffe54c",
            dark: "#c68400",
            contrastText: "#000000"
        },
        background: {
            default: "#fff",
        },
    },
    overrides: {
        MuiTab: {
            root: {
                "&:hover": {
                    backgroundColor: "#c158dc"
                }
            },
            textColorPrimary: {
                "&:hover": {
                    backgroundColor: "#e1bee7"
                }
            },
            textColorSecondary: {
                "&:hover": {
                    backgroundColor: "#ffecb3"
                }
            }
        }
    }
});

export default theme;
