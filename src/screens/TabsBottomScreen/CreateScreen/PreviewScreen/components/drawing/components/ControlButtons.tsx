import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ControlButtonsProps {
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onClear: () => void;
    canUndo: boolean;
    canRedo: boolean;
    showToolbar: boolean;
    onToggleToolbar: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
    onUndo,
    onRedo,
    onSave,
    onClear,
    canUndo,
    canRedo,
    showToolbar,
    onToggleToolbar,
}) => {
    return (
        <>
            {/* Action buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton} onPress={onSave}>
                    <MaterialIcons name="save" size={24} color="white" />
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={onClear}>
                    <MaterialIcons name="clear" size={24} color="white" />
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
            </View>

            {/* Undo/Redo buttons */}
            <View style={[
                styles.undoRedoButtons,
                { bottom: showToolbar ? 140 : 20 }
            ]}>
                <TouchableOpacity
                    style={[
                        styles.iconButton,
                        !canUndo && styles.disabledButton
                    ]}
                    onPress={onUndo}
                    disabled={!canUndo}
                >
                    <MaterialIcons name="undo" size={28} color={!canUndo ? "#888888" : "black"} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.iconButton,
                        !canRedo && styles.disabledButton
                    ]}
                    onPress={onRedo}
                    disabled={!canRedo}
                >
                    <MaterialIcons name="redo" size={28} color={!canRedo ? "#888888" : "black"} />
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    actionButtons: {
        position: 'absolute',
        top: 40,
        right: 20,
        flexDirection: 'column',
    },
    actionButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        marginLeft: 5,
        fontWeight: 'bold',
    },
    undoRedoButtons: {
        position: 'absolute',
        left: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        marginHorizontal: 5,
    },
    disabledButton: {
        opacity: 0.5,
    },
    toggleButton: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 20,
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default ControlButtons; 