import React from 'react';
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import {Box} from "@material-ui/core";

/**
 * Footer displayed on every page. Mainly contains copyright info.
 */
export default function PageFooter() {
    return (
        <Box m={3} component="footer">
            <Typography variant="body2" color="textSecondary" align="center">
                {'Made by '}
                <Link color="inherit" href={process.env.authorLink} target="_blank">
                    {process.env.author}
                </Link>{' '}
                {'in \u{1f5fc} Tokyo \u{1f5fc} !'}
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center">
                {'Icon made by '}
                <Link color="inherit" href="https://www.flaticon.com/authors/freepik" target="_blank">
                    Freepik
                </Link>
                {' from '}
                <Link color="inherit" href="https://www.flaticon.com/" target="_blank">
                    flaticon.com
                </Link>
            </Typography>
        </Box>
    );
}
