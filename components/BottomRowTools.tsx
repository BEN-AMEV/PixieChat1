import { CameraMode } from "expo-camera";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface BottomRowToolsProps{
    cameraMode: CameraMode,
    setCameraMode: React.Dispatch<React.SetStateAction<CameraMode>>

}
export default function BottomRowTools({cameraMode, setCameraMode}: BottomRowToolsProps) {
    return (
        <View style={[styles.bottomContainer, styles.directionRowItemsCenter ]}>
            {/* <Link href={"/media-library"} asChild>
            <IconButton 
            iosName="photo.stack" androidName="stats-chart" onPress={() => {}} 
        />
        </Link> */}
        <View style={styles.directionRowItemsCenter}>   
            <TouchableOpacity onPress={() => {
                 <ThemedText lightColor="yellow"
                 darkColor="red"
                 style={{
                     fontWeight: cameraMode === "picture" ? "bold" : "100",
                 }}>
                        ASSas
                    </ThemedText>
                setCameraMode("picture")}}>   
                <ThemedText lightColor="yellow"
                darkColor="red"
                style={{
                    fontWeight: cameraMode === "picture" ? "bold" : "100",
                }}>
                 Snap
                </ThemedText>
                </TouchableOpacity> 
                
                <TouchableOpacity onPress={() => {
                    
                    setCameraMode("video")}}>   
                <ThemedText lightColor="orange"
                darkColor="orange"
                style={{
                    fontWeight: cameraMode === "video" ? "bold" : "100",
                }}>
                 Video
                </ThemedText>
                </TouchableOpacity>   
        </View>
        {/* <IconButton androidName="add" iosName="magnifyingglass" /> */}
        </View>
    );
}
const styles = StyleSheet.create({
    directionRowItemsCenter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
    },
    bottomContainer: {
        position: "absolute",
        bottom: 6,
        width: "100%",
        justifyContent: "space-between",
        alignSelf: "center",
    },
});