/* This code snippet is defining a functional component called `ZigzagView` in a TypeScript React
application. */
// import React, { useState } from 'react'
// import { StyleSheet, View } from 'react-native'
// import ZigzagLines from 'react-native-zigzag-lines'

// const ZigzagView = (props: { [x: string]: any; children?: any; style?: any; contentContainerStyle?: any; zigzagProps?: any; backgroundColor?: any; surfaceColor?: any; bottom?: any; top?: any }) => {
//     const {
//         style,
//         contentContainerStyle,
//         zigzagProps,
//         backgroundColor: backColor,
//         surfaceColor: surfColor,
//         bottom = true,
//         top = true,
//         ...restProps
//     } = props
//     const [width, setWidth] = useState<number | undefined>();
//     const backgroundColor = backColor || (style ? StyleSheet.flatten(style).backgroundColor : undefined)
//     const surfaceColor = surfColor || (contentContainerStyle ? StyleSheet.flatten(contentContainerStyle).backgroundColor : undefined)
//     return <View
//         {...restProps}
//         style={[
//             {
//                 flexDirection: 'column',
//                 justifyContent: 'center',
//             },
//             style,
//             { backgroundColor },
//         ]}
//     >
//         {/* {Boolean(top) && typeof width == 'number' && <ZigzagLines
//             {...zigzagProps}
//             width={width}
//             position="top"
//             backgroundColor={backgroundColor}
//             color={surfaceColor}
//         />} */}
//         <View
//             onLayout={e => setWidth(e.nativeEvent.layout.width)}
//             style={[
//                 contentContainerStyle,
//                 { backgroundColor: surfaceColor },
//             ]}
//         >
//             {props.children}
//         </View>
//         {Boolean(bottom) && typeof width == 'number' && <ZigzagLines
//             {...zigzagProps}
//             width={width}
//             position="bottom"
//             backgroundColor={backgroundColor}
//             color={surfaceColor}
//         />}
//     </View>
// }

// export default ZigzagView