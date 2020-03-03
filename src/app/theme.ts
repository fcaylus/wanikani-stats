import {createMuiTheme, responsiveFontSizes} from '@material-ui/core/styles';

/**
 * Theme for the main app.
 */
const originalTheme = createMuiTheme();
const theme = {
    ...originalTheme, ...responsiveFontSizes(createMuiTheme({
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
            },
            MuiCardContent: {
                root: {
                    padding: originalTheme.spacing(2),
                    "&:last-child": {
                        paddingBottom: originalTheme.spacing(3)
                    },
                    [originalTheme.breakpoints.down("xs")]: {
                        padding: originalTheme.spacing(1),
                        "&:last-child": {
                            paddingBottom: originalTheme.spacing(2)
                        }
                    }
                }
            },
            MuiCardHeader: {
                root: {
                    padding: originalTheme.spacing(2),
                    [originalTheme.breakpoints.down("xs")]: {
                        padding: originalTheme.spacing(1)
                    }
                }
            }
        }
    }))
};

export default theme;
