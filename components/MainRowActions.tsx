import React, { useEffect, useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { CameraMode } from "expo-camera";
import { Image } from "expo-image";
import { Asset, getAlbumsAsync, getAssetsAsync } from "expo-media-library";
import { SymbolView } from "expo-symbols";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import AnimatedButton from "./AnimatedIcon";

interface MainRowActionsProps {
    handleTakePicture: () => void;
    cameraMode: CameraMode;
    isRecording: boolean;
    isLoading?: boolean;
}
export default function MainRowActions({
    cameraMode,
    handleTakePicture,
    isRecording,
    isLoading = false,
}: MainRowActionsProps): React.ReactElement { 
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filterColor, setFilterColor] = useState<string | null>(null);

   useEffect(() =>{
    getAlbums();
   }, []);

    async function getAlbums() {
        const fetchedAlbums = await getAlbumsAsync();
        const albumAssets = await getAssetsAsync({
            //album: fetchedAlbums[0],
            mediaType: "photo",
            first: 4,
            sortBy: "creationTime",
        });
        setAssets(albumAssets.assets);
    }
    return (
      <View style={styles.container}> 
     
       <FlatList 
       data={assets}
       windowSize={2}
       inverted
       showsHorizontalScrollIndicator={false}
       renderItem={({ item })=> (
        <Image 
        key={item.id}
        source={item.uri}
        style={{
            width: 51,
            height: 55,
            borderRadius: 13,
        }}
        />
       )} 
       horizontal
       contentContainerStyle={{ gap: 6 }}
       /> 
        <TouchableOpacity onPress={handleTakePicture}>
<SymbolView 
            name=
            {cameraMode === "picture" ? "circle" : isRecording ? "record.circle" : "circle.circle"} 
            size={90}
            type="hierarchical"
            tintColor={isRecording ? Colors.light.snapPrimary : "white"}
            animationSpec={{
                effect: {
                    type: isRecording ? "pulse" : "bounce"
                },
                repeating: isRecording
            }}          
            fallback={
                <AnimatedButton onPress={handleTakePicture}
                    iosName="circle"
                    androidName={cameraMode === "picture" ? "ellipse-outline" : isRecording ? "videocam" : "ellipse-outline"}
                    width={90}
                    height={90}    
                />
            }
/>  
        </TouchableOpacity>


          <TouchableOpacity onPress={() => setFilterColor('rgba(255, 200, 0, 0.3)')}>
            <Text style={styles.button}>Warm</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilterColor('rgba(0, 0, 0, 0.4)')}>
            <Text style={styles.button}>Night</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilterColor('rgba(150, 75, 0, 0.3)')}>
            <Text style={styles.button}>Sepia</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFilterColor(null)}>
            <Text style={styles.button}>Clear</Text>
          </TouchableOpacity>

        {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 2 }} >
        {[0, 1, 2, 3].map((item) => (
            <SymbolView 
                key={item}
                name="face.dashed"
                size={40}
                type="hierarchical"
                tintColor="white"
                onPress={() => alert("No filters loaded, please try again later.")}

                fallback={
                    <Ionicons
                    key={item}
                    name="happy-outline"
                    size={50}
                    color="white"
                    type="hierarchical"
                    onPress={() => alert("No filters loaded, please try again later.")}
                    />
                }
        />
        ))}
        </ScrollView> */}
      </View>  
    );
}

const styles = StyleSheet.create({
    container: {
        // width: "150%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "sticky",
        bottom: 45,
        height: 100,
        marginLeft: 0,
        marginTop: 660,
        flex: 1,
        gap: 10,
    },
    button: {
    backgroundColor: '#ffffffaa',
    padding: 10,
    borderRadius: 10,
    },
    button1: {
    backgroundColor: '#ffaaaaaa',
    padding: 10,
    borderRadius: 10,
    }
});