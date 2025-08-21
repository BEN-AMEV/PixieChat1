import { saveToLibraryAsync } from "expo-media-library";
import { shareAsync } from "expo-sharing";
import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import { Alert, View } from "react-native";
import IconButton from "./IconButton";

interface VideoViewComponentProps {
    video: string;
    setVideo: React.Dispatch<React.SetStateAction<string>>
}

export default function VideoViewComponent(
    {video, setVideo,
}: VideoViewComponentProps) {
    const videoViewRef = React.useRef<VideoView>(null);
     const [isPlaying, setIsPlaying] = React.useState(true);
    const player = useVideoPlayer(video, (player) => {
        player.loop= true;
        player.muted= false;
        player.play();
    });

    React.useEffect(() => {
       const subscription = player.addListener("playingChange", (isPlaying) => {
        })

        return () => {
            subscription.remove()
        }
    }, [player]);
    return (
        <View>
            <View 
                style={{
                    position: 'absolute',
                    zIndex: 1,
                    top: 50,
                    right: 10,
                    gap: 16,
                }}>
<IconButton 
iosName="arrow.down"
androidName="save-outline"
onPress={async () => {
    await saveToLibraryAsync(video); 
    Alert.alert("Video saved to library.")
    }}
/>
{/* <IconButton 
iosName={"square.dashed"}
androidName="close"
onPress={() => setVideo("")}
/>
<IconButton 
iosName={"circle.dashed"}
androidName="close"
onPress={() => setVideo("")}
/> */}
<IconButton 
iosName={isPlaying ? "pause" : "play"}
androidName={isPlaying ? "pause" : "play"}
onPress={() => {
    if (isPlaying) {
        player.pause();
    } else {
        player.play();
    }
    setIsPlaying(!isPlaying);
}}
/>
<IconButton 
iosName="square.and.arrow.up"
androidName="arrow-up"
onPress={async () => await shareAsync(video, {dialogTitle: "Share Picture"})}
/>
            </View>
        <View 
            style={{
                zIndex: 1,
                position: 'absolute',
                paddingTop: 50,
                left: 10,
            }}>
                <IconButton 
                onPress={() => setVideo("")}
                iosName={"xmark"}
                androidName="close"
                />
                </View>
            <VideoView
             ref={videoViewRef}
              style={{
                width: "100%",
                height: "100%",
            }}
            player={player}
            allowsFullscreen
            nativeControls={true}
            />
        </View>
    );
}