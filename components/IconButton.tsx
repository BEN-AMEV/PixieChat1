import { Ionicons } from "@expo/vector-icons";
import { SFSymbol, SymbolView } from "expo-symbols";
import React, { ComponentProps } from "react";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";

const CONTAINER_PADDING = 3;
const CONTAINER_WIDTH = 34;
const ICON_SIZE = 29;

interface IconButtonProps {
    iosName: SFSymbol;
    androidName: ComponentProps<typeof Ionicons>['name'];
    containerStyle?: StyleProp<ViewStyle>;
    onPress: () => void;
    width?: number;
    height?: number;
}

export default function IconButton({
    androidName,
    iosName,
    containerStyle,
    onPress,
    width,
    height 
}: IconButtonProps) {
return (
    <TouchableOpacity
    onPress={onPress}
    style={[{
        backgroundColor: "#FFFFFF25",
        padding: CONTAINER_PADDING,
        borderRadius: (CONTAINER_WIDTH + CONTAINER_PADDING * 2) / 2,
        width: CONTAINER_WIDTH,
    }, 
    containerStyle]}
    >
        <SymbolView
        name={iosName}
        size={ICON_SIZE}
        style={
            width && height ? 
            {width, height } : {}}
         tintColor={"white"}
        
        fallback={
            <Ionicons
                size={ICON_SIZE}
                color="white" 
                name={androidName}
            />
        }
        />
    </TouchableOpacity>
)
}
// Usage example:
// <IconButton
//   icon={<SomeIconComponent />}   