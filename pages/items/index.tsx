import {ReduxNextPageContext} from "../../src/app/redux/interfaces";
import redirect, {DEFAULT_REDIRECT_URL} from "../../src/redirect";

function DefaultItemPage() {
    return null
}

DefaultItemPage.getInitialProps = async (ctx: ReduxNextPageContext) => {
    redirect(DEFAULT_REDIRECT_URL, ctx.req, ctx.res, true);
};

export default DefaultItemPage;
