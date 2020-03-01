import {createMuiTheme} from '@material-ui/core/styles';

/**
 * Theme for the main app.
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
            main: "#ffa000",
            light: "#ffd149",
            dark: "#c67100",
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
        },
        MuiTableRow: {
            root: {
                "&$selected, &$selected:hover": {
                    backgroundColor: "#e1bee7",
                    "& > *": {
                        fontWeight: "bold !important"
                    }
                }
            }
        }
    }
});

export default theme;
