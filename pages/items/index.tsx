import {ReduxNextPageContext} from "../../src/app/redux/interfaces";
import redirect from "../../src/redirect";

function DefaultItemPage() {
    return null
}

DefaultItemPage.getInitialProps = async (ctx: ReduxNextPageContext) => {
    redirect("/items/kanji/wanikani", ctx.req, ctx.res, true);
};

export default DefaultItemPage;
