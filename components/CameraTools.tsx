import { FlashMode } from "expo-camera";
import React from "react";
import { View } from "react-native";
import IconButton from "./IconButton";

interface CameraToolsProps {
cameraZoom: number;
cameraTorch: boolean;
cameraFlash: FlashMode
setCameraZoom: React.Dispatch<React.SetStateAction<number>>;
setCameraTorch: React.Dispatch<React.SetStateAction<boolean>>;
setCameraFlash: React.Dispatch<React.SetStateAction<FlashMode>>;
setCameraFacing: React.Dispatch<React.SetStateAction<"front" | "back">>;
}
export default  function CameraTools(
    {
        cameraZoom,
        cameraTorch,
        cameraFlash,
        setCameraZoom,
        setCameraTorch,
        setCameraFlash,
        setCameraFacing
    }: CameraToolsProps) {
    return (
        <View 
        style={{
            position: "absolute",
            zIndex: 1,
            gap: 16,
            right: 9,
            top: 50,
        }}
        >
            <IconButton
                onPress={() => 
                    setCameraTorch((prevValue) => !prevValue)
                }
                iosName={cameraTorch ? "flashlight.off.circle" : "flashlight.slash.circle"}
                androidName="flashlight-outline"
            />
            
            <IconButton
                onPress={() => 
                    setCameraFacing((prevValue) => 
                    prevValue === "back" ? "front" : "back")
                }
                iosName={"arrow.triangle.2.circlepath.camera"}
                androidName={"reload-outline"}
                width={25}
                height={21}
            />
            <IconButton
                onPress={() => 
                    setCameraFlash((prevValue) => (prevValue === "off" ? "on" : "off"))
                }
                iosName={cameraFlash === "on" ? "bolt.circle" : "bolt.slash.circle"}
                androidName="flash-outline"
            />
            {/* <IconButton
                onPress={() => {}}
                iosName={"speaker"}
                androidName="volume-high-outline"
            /> */}
            
            <IconButton
                onPress={() => {
                    // increase zoom by 0.01
                    if (cameraZoom < 1) {
                        setCameraZoom((prevValue) => prevValue + 0.1);
                    }
                }}
                iosName={"plus.magnifyingglass"}
                androidName="add"
                />
            <IconButton
                onPress={() => {
                    // decrease zoom by 0.01
                    if (cameraZoom > 0) {
                        setCameraZoom((prevValue) => prevValue - 0.1);
                    }
                }}
                iosName={"minus.magnifyingglass"}
                androidName="remove"
                />
        </View>
    );
}