import React from "react";
import {Item} from "../../../data/interfaces/item";
import colors from "../../colors";
import {colorForSRS} from "../../srs";
import capitalize from "../../../capitalize";

export const ITEM_WIDTH = 22;
export const ITEM_HEIGHT = 32;
export const ITEM_SPACING = 4;
export const ITEM_PADDING = 4;
export const ITEM_CORNER_RADIUS = 4;

interface SVGItemCardProps {
    x: number;
    y: number;
    width: number;
    text: string;
    item: Item;
}

/**
 * Display any item (kanji, radical, vocabulary) as an inline card shape (as an SVG component)
 * This component uses memoization since it rarely change after the first rendering and only depends on its props.
 */
const ItemCard = React.memo((props: SVGItemCardProps) => {
    const textColor = (props.item.srs && props.item.srs > 0) ? colors.white : colors.black;

    return (
        <g>
            <title>
                {(props.item.image && props.text == "" ? capitalize(props.item.name) : props.text)
                + (props.item.readings ? (" (" + props.item.readings.join(" / ") + ")") : "")}
            </title>
            <a
                href={props.item.url}
                target="_blank"
                rel="noopener">
                <rect x={props.x} y={props.y} width={props.width} height={ITEM_HEIGHT}
                      rx={ITEM_CORNER_RADIUS} ry={ITEM_CORNER_RADIUS}
                      fill={(props.item.srs && props.item.srs > 0) ? colorForSRS(props.item.srs) : colors.unknown}
                      filter="url(#card-shadow)"/>
                {props.text != "" && (
                    <text
                        x={props.x + ITEM_PADDING}
                        y={props.y + ITEM_HEIGHT / 2}
                        dominantBaseline="middle"
                        fill={textColor}>
                        {props.text}
                    </text>
                )}
                {props.text == "" && props.item.image && (
                    <image
                        x={props.x + ITEM_PADDING}
                        y={props.y + ITEM_HEIGHT / 2 - 8}
                        href={props.item.image}
                        width={16} height={16}
                        stroke={textColor}
                        fill={textColor}/>
                )}
            </a>
        </g>
    );
});

export default ItemCard;
