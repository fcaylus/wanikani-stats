import {ReduxNextPageContext} from "../../../src/app/redux/interfaces";
import redirect from "../../../src/redirect";

function DefaultStatsPage() {
    return null
}

DefaultStatsPage.getInitialProps = async (ctx: ReduxNextPageContext) => {
    const {item_type} = ctx.query;
    redirect("/stats/" + item_type.toString() + "/jlpt", ctx.req, ctx.res, true);
};

export default DefaultStatsPage;
