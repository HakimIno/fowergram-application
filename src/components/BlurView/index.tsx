// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
// import { Canvas, Fill, Rect, rrect, rect } from '@shopify/react-native-skia';
// import { Host, Portal } from 'react-native-portalize';
// import { BlurView } from 'expo-blur';

// const { width } = Dimensions.get('window');

// export default function CustomToast() {
//   const [visible, setVisible] = useState(false);

//   const showToast = () => setVisible(true);
//   const hideToast = () => setVisible(false);

//   // กำหนดขนาดและตำแหน่งของ Toast
//   const toastWidth = width - 30;
//   const toastHeight = 60;
//   const cornerRadius = 10;

//   // กำหนด clip สำหรับ Toast
//   const toastRect = rect(0, 0, toastWidth, toastHeight);
//   const roundedRect = rrect(toastRect, cornerRadius, cornerRadius);

//   return (
//     <Host>
//       {/* พื้นที่หลักของแอป */}
//       <View style={styles.container}>
//         {/* Backdrop Blur และ Toast */}
//         {visible && (
//           <Portal >
//             {/* ชั้นสำหรับ BlurView */}
//             <BlurView
//               style={styles.overlay}
//               intensity={10}
//               experimentalBlurMethod="dimezisBlurView"
              
//             />

//             {/* ชั้นสำหรับ Toast (ไม่ถูกเบลอ) */}
//             <View style={styles.toastWrapper}>
//               <Canvas style={{ width: toastWidth, height: toastHeight }}>
//                 <Fill color="rgba(255, 255, 255, 0.8)" clip={roundedRect} />
//               </Canvas>

//               <View style={styles.toastContent}>
//                 <Text style={styles.text}>แจ้งเตือน</Text>
//                 <View style={styles.buttonContainer}>
//                   {/* ปุ่มรายงาน */}
//                   <TouchableOpacity
//                     style={styles.button}
//                     onPress={() => {
//                       console.log('รายงาน');
//                       hideToast();
//                     }}
//                   >
//                     <Text style={styles.reportButton}>รายงาน</Text>
//                   </TouchableOpacity>

//                   {/* ปุ่มยกเลิก */}
//                   <TouchableOpacity
//                     style={styles.button}
//                     onPress={hideToast}
//                   >
//                     <Text style={styles.cancelButton}>ยกเลิก</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </Portal>
//         )}

//         {/* ปุ่ม "แสดง Toast" (ไม่ถูกเบลอ) */}
//         <View style={styles.triggerWrapper}>
//           <TouchableOpacity onPress={showToast} style={styles.triggerButton}>
//             <Text>แสดง Toast</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Host>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   triggerWrapper: {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: [{ translateX: -50 }, { translateY: -20 }],
//     alignItems: 'center',
//   },
//   triggerButton: {
//     padding: 10,
//     backgroundColor: '#ddd',
//     borderRadius: 5,
//   },
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   toastWrapper: {
//     position: 'absolute',
//     bottom: 65,
//     left: 15,
//     right: 15,
//     height: 60,
//   },
//   toastContent: {
//     ...StyleSheet.absoluteFillObject,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   text: {
//     fontSize: 16,
//     color: '#000',
//     fontWeight: '500',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 15,
//   },
//   icon: {
//     marginRight: 5,
//   },
//   reportButton: {
//     color: 'red',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   cancelButton: {
//     color: '#000',
//     fontSize: 14,
//     fontWeight: '500',
//   },
// });