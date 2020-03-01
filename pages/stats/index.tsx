import {ReduxNextPageContext} from "../../src/app/redux/interfaces";
import redirect from "../../src/redirect";

function DefaultStatsPage() {
    return null
}

DefaultStatsPage.getInitialProps = async (ctx: ReduxNextPageContext) => {
    redirect("/stats/kanji/jlpt", ctx.req, ctx.res, true);
};

export default DefaultStatsPage;
