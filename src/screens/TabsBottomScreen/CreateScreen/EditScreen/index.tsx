// import React, { useState, useCallback } from 'react';
// import { Button, StyleSheet, View, Image, Alert, Dimensions, ActivityIndicator } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import ImageEditor from '@thienmd/react-native-image-editor';
// import * as FileSystem from 'expo-file-system';
// import { LinearGradient } from 'expo-linear-gradient';

// const { width, height } = Dimensions.get('window');
// const SANDBOX_IMAGE_PATH = `${FileSystem.documentDirectory}photo.jpg`;

// const EditScreen = () => {
//     const [selectedImage, setSelectedImage] = useState<string | null>(null);
//     const [editedImage, setEditedImage] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);

//     const pickImage = useCallback(async () => {
//         try {
//             const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//             if (status !== 'granted') {
//                 Alert.alert('Permission Denied', 'Please grant access to your photo library.');
//                 return;
//             }

//             const result = await ImagePicker.launchImageLibraryAsync({
//                 mediaTypes: 'images',
//                 allowsEditing: false,
//                 quality: 1,
//             });

//             if (!result.canceled && result.assets?.[0]?.uri) {
//                 setSelectedImage(result.assets[0].uri);
//             }
//         } catch (error) {
//             console.error('Image picker error:', error);
//             Alert.alert('Error', 'Failed to pick image.');
//         }
//     }, []);

//     const editImage = useCallback(async (uri: string) => {
//         try {
//             setLoading(true);
//             await FileSystem.copyAsync({ from: uri, to: SANDBOX_IMAGE_PATH });
//             const fileInfo = await FileSystem.getInfoAsync(SANDBOX_IMAGE_PATH);
//             if (!fileInfo.exists) throw new Error('File copy failed.');

//             await ImageEditor.Edit({
//                 path: SANDBOX_IMAGE_PATH,
//                 hiddenControls: [],
//                 languages: { doneTitle: 'Done', saveTitle: 'Save', clearAllTitle: 'Clear All' },
//                 onDone: (imagePath: string) => {
//                     setEditedImage(imagePath);
//                     Alert.alert('Success', 'Image edited successfully!');
//                 },
//                 onCancel: () => Alert.alert('Cancelled', 'Editing was cancelled.'),
//             });
//         } catch (error) {
//             console.error('Edit image error:', error);
//             Alert.alert('Error', `Failed to edit image: ${error.message}`);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     return (
//         <LinearGradient colors={['#fff', '#f5f5f5']} style={styles.container}>
//             {!selectedImage ? (
//                 <Button title="Pick an Image" onPress={pickImage} color="#3897f0" />
//             ) : (
//                 <View style={styles.previewContainer}>
//                     <Image source={{ uri: selectedImage }} style={styles.previewImage} />
//                     {loading ? (
//                         <ActivityIndicator size="large" color="#3897f0" />
//                     ) : (
//                         <View style={styles.buttonContainer}>
//                             <Button title="Edit" onPress={() => editImage(selectedImage)} color="#3897f0" />
//                             {editedImage && (
//                                 <Image source={{ uri: editedImage }} style={styles.previewImage} />
//                             )}
//                         </View>
//                     )}
//                 </View>
//             )}
//         </LinearGradient>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     previewContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     previewImage: {
//         width: width * 0.9,
//         height: height * 0.5,
//         borderRadius: 10,
//         marginVertical: 20,
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         width: width * 0.9,
//     },
// });

// export default EditScreen;