import React from "react";
import { Path, Svg, G } from "react-native-svg";

export type Linecap = "butt" | "round" | "square";
export type Linejoin = "miter" | "round" | "bevel";

export type PathData = {
    d: string;
    fillRule?: "nonzero" | "evenodd";
    clipRule?: "nonzero" | "evenodd";
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeLinecap?: Linecap;
    strokeLinejoin?: Linejoin;
};

export type SvgElement = {
    type: 'path' | 'g';
    props: PathData | { children: SvgElement[] };
};

export interface SvgIconProps {
    path: string | SvgElement[];
    color: string;
    size: number;
    stroke: number;
}

export const SvgIcon: React.FC<SvgIconProps> = ({
    path,
    color,
    size,
    stroke
}) => {
    const renderSvgElement = (element: SvgElement, index: number) => {
        if (element.type === 'path') {
            const pathProps = element.props as PathData;
            return (
                <Path
                    key={index}
                    d={pathProps.d}
                    fillRule={pathProps.fillRule || "evenodd"}
                    clipRule={pathProps.clipRule || "evenodd"}
                    fill={pathProps.fill || "none"}
                    stroke={pathProps.stroke || color}
                    strokeWidth={pathProps.strokeWidth || stroke}
                    strokeLinecap={pathProps.strokeLinecap}
                    strokeLinejoin={pathProps.strokeLinejoin}
                />
            );
        } else if (element.type === 'g') {
            const gProps = element.props as { children: SvgElement[] };
            return (
                <G key={index}>
                    {gProps.children.map((child, childIndex) => renderSvgElement(child, childIndex))}
                </G>
            );
        }
        return null;
    };

    return (
        <>
            <Svg
                viewBox="0 0 24 24"
                width={size}
                height={size}
                color={color}
                strokeWidth={stroke}
                stroke={color}
            >
                {typeof path === 'string' ? (
                    <Path
                        fillRule="evenodd"
                        d={path}
                        clipRule="evenodd"
                        fill={color}
                    />
                ) : (
                    path.map((element, index) => renderSvgElement(element, index))
                )}
            </Svg>
        </>
    );
};

