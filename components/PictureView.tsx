import { Image } from "expo-image";
import { saveToLibraryAsync } from "expo-media-library";
import { shareAsync } from "expo-sharing";
import React from "react";
import { Alert, View } from "react-native";
import IconButton from "./IconButton";

interface PictureViewProps {
    picture: string;
    setPicture: React.Dispatch<React.SetStateAction<string>>
}


export default function PictureView({picture, setPicture}: PictureViewProps) {
    return (
        <View>
            <View 
                style={{
                    position: 'absolute',
                    zIndex: 1,
                    top: 40,
                    right: 10,
                    gap: 16,
                }}>
<IconButton 
iosName="arrow.down"
androidName="save-outline"
onPress={async () => {
    await saveToLibraryAsync(picture); 
    Alert.alert("Picture saved to library.")
    }}
/>
{/*<IconButton 
iosName={"square.dashed"}
androidName="square-outline"
onPress={() => setPicture("")}
/>
 <IconButton 
iosName={"circle.dashed"}
androidName="close"
onPress={() => setPicture("")}
/>
<IconButton 
iosName={"triangle.bottomhalf.filled"}
androidName="close"
onPress={() => setPicture("")}
/> */}
<IconButton 
iosName="square.and.arrow.up"
androidName="arrow-up-outline"
onPress={async () => await shareAsync(picture, {dialogTitle: "Share Picture"})}
/>
            </View>
        <View 
            style={{
                zIndex: 1,
                position: 'absolute',
                paddingTop: 40,
                left: 10,
            }}>
                <IconButton 
                onPress={() => setPicture("")}
                iosName={"xmark"}
                androidName="close"
                />
                </View>
            <Image source={picture} style={{
                width: '100%',
                height: '100%'
            }}/>
        </View>
    )
}