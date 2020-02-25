import {ReduxNextPageContext} from "../../src/app/redux/interfaces";
import redirect from "../../src/server/redirect";

function DefaultItemPage() {
    return null
}

DefaultItemPage.getInitialProps = async (ctx: ReduxNextPageContext) => {
    redirect("/items/kanji/wanikani", ctx.res, true);
};

export default DefaultItemPage;
