import React from "react";
import clsx from "clsx";
import {useRouter} from "next/router";
import NextLink from "next/link";
import MuiLink from "@material-ui/core/Link";
import {UrlObject} from "url";

interface NextComposedProps {
    as?: string | UrlObject;
    href: string;
    prefetch?: boolean;

    // Random properties
    [prop: string]: any;
}

const NextComposed = React.forwardRef(function NextComposed(props: NextComposedProps, ref: React.Ref<any>) {
    const {as, href, prefetch, ...other} = props;

    return (
        <NextLink href={href} prefetch={prefetch} as={as}>
            <a ref={ref} {...other} />
        </NextLink>
    );
});

interface LinkProps {
    activeClassName?: string;
    as?: string;
    className?: string;
    href: string;
    innerRef?: any;
    naked?: boolean;
    onClick?: any;
    prefetch?: boolean;

    // Random properties
    [prop: string]: any;
}

/**
 * Styled version links. If props.naked is false (default), use MUI <Link /> with internal Next <Link />
 * @param props
 * @constructor
 */
function Link(props: LinkProps) {
    const {
        activeClassName = "active",
        className: classNameProps,
        innerRef,
        naked = false,
        ...other
    } = props;
    const router = useRouter();

    const className = clsx(classNameProps, {
        [activeClassName]: router.pathname === props.href && activeClassName,
    });

    if (naked) {
        return <NextComposed className={className} ref={innerRef} {...other} />;
    }

    return <MuiLink component={NextComposed} className={className} ref={innerRef} {...other} />;
}

export default React.forwardRef((props: LinkProps, ref) => <Link {...props} innerRef={ref}/>);
