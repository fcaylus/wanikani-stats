import {ReduxNextPageContext} from "../../../src/app/redux/interfaces";
import redirect from "../../../src/server/redirect";

function DefaultItemPage() {
    return null
}

DefaultItemPage.getInitialProps = async (ctx: ReduxNextPageContext) => {
    const {item_type} = ctx.query;
    redirect("/items/" + item_type.toString() + "/wanikani", ctx.res, true);
};

export default DefaultItemPage;
