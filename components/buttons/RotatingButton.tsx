import { AppConstants } from '@/constants/AppConstants'
import { Colors } from '@/constants/Colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React, { useRef } from 'react'
import { Animated, Pressable, StyleSheet } from 'react-native'


interface RotatingButtonProps {
    iconName?: string
    iconSize?: number
    iconColor?: string
    duration?: number
    onPress: () => any
}


const RotatingButton = ({
    iconName = 'reload-circle-outline',
    iconSize = 32,
    iconColor = Colors.white,
    duration = 500,
    onPress
}: RotatingButtonProps) => {
    const spinAnim = useRef(new Animated.Value(0)).current;
    
    const handlePress = () => {
        onPress()
        spinAnim.setValue(0);
        Animated.timing(spinAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
        }).start();
    };
        
    const spinInterpolate = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Pressable onPress={handlePress} hitSlop={AppConstants.hitSlop}>
            <Animated.View
            style={[
                styles.box,
                { width: iconSize, height: iconSize, transform: [{ rotate: spinInterpolate }] },
            ]}>
                <Ionicons name={iconName as any} size={iconSize} color={iconColor}/>
            </Animated.View>
        </Pressable>
    )
}

export default RotatingButton

const styles = StyleSheet.create({
    box: {
        justifyContent: 'center',
        alignItems: 'center'
    },
})