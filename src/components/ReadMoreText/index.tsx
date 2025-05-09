import React, { useState } from "react";
import { TextLayoutLine, Text, Pressable, TouchableOpacity } from "react-native";
import { IReadMoreTextProps } from "./interfaces/IReadMoreTextProps";

import { isAndroid, isiOS } from "./util/Platform";

interface TextProperties {
    length: number;
    isTruncatedText: boolean;
}

export default function ReadMoreText({
    style,
    numberOfLines = 1,
    children,
    readMoreText = "more",
    readLessText = "less",
    readMoreStyle = { color: "black", fontSize: 10 },
    readLessStyle = { color: "black" },
    ...props
}: IReadMoreTextProps) {
    const [readMore, setReadMore] = useState<boolean>(false);
    const [text, setText] = useState<TextProperties>({
        length: 0,
        isTruncatedText: false,
    });
    const getReadMoreStyle = () => {
        if (readMore) {
            return readLessStyle;
        }
        return readMoreStyle;
    }

    function handleReadMoreText(textLayoutLines: TextLayoutLine[]) {
        let textLength = 0;
        if (textLayoutLines.length > numberOfLines) {
            for (var line = 0; line < numberOfLines; line++) {
                textLength += textLayoutLines[line].text.length;
            }
            setText({ length: textLength, isTruncatedText: true });
            return;
        }
        setText({ length: children.length, isTruncatedText: false });

    }
    return (
        <TouchableOpacity onPress={() => { }} activeOpacity={0.8}>
            {isiOS && (
                <Text
                    style={{ height: 0 }}
                    onTextLayout={({ nativeEvent: { lines } }) => {
                        if (text.length > 0) {
                            return;
                        }
                        if (isiOS()) {
                            handleReadMoreText(lines);
                        }
                    }}
                >
                    {children}
                </Text>
            )}
            <Text
                style={style}
                numberOfLines={text.length === 0 ? numberOfLines : 0}
                onTextLayout={({ nativeEvent: { lines } }) => {
                    if (text.length > 0) {
                        return;
                    }
                    if (isAndroid()) {
                        handleReadMoreText(lines);
                    }
                }}
                {...props}
            >
                {text.isTruncatedText && !readMore && text.length !== 0
                    ? `${highlightHashTags(children.slice(0, text.length - 10).trim())}...`
                    : highlightHashTags(children)}
                {text.isTruncatedText && (
                    <Text
                        style={[getReadMoreStyle(), { fontSize: 12 }]}
                        onPress={() => setReadMore(!readMore)}
                    >
                        {readMore ? null : readMoreText}
                    </Text>
                )}
            </Text>
        </TouchableOpacity>
    );
}

const highlightHashTags = (text: string) => {
    const parts = text.split(/(#[^\s]+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('#')) {
            return (
                <Text key={index} style={{ color: '#1a1a1a', fontFamily: 'Chirp_Bold', }}>
                    {part}
                </Text>
            );
        }
        return part;
    });
};