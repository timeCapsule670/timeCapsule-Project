import React, { useEffect, useRef } from "react";
import { StyleSheet, Dimensions, View, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";

const { width, height } = Dimensions.get("window");

export default function IntroAnimationScreen() {
  const router = useRouter();
  const blurAnim = useRef(new Animated.Value(0)).current;

  // load local mp4 file
  const player = useVideoPlayer(require("../assets/video/TimeLapse26-8-25_compressed.mp4"), (player) => {
    player.loop = false;   // play only once
    player.play();         // auto-play
  });

  // when video finishes → navigate with blur transition
  useEffect(() => {
    const timer = setTimeout(() => {
      // Start blur transition
      Animated.timing(blurAnim, {
        toValue: 1,
        duration: 800, // 800ms blur transition
        useNativeDriver: true,
      }).start(() => {
        // Navigate after blur completes
        router.replace("/");
      });
    }, 7000); // 7 seconds to ensure video plays completely
    
    return () => clearTimeout(timer);
  }, [router, blurAnim]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"   
        nativeControls={false}  
      />
      
      {/* Blur overlay that animates in */}
      <Animated.View 
        style={[
          styles.blurOverlay,
          {
            opacity: blurAnim,
          }
        ]}
      >
        <BlurView
          intensity={50}
          style={styles.blurView}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",  
        alignItems: "center",
        backgroundColor:"#ffffff"      
      },
      video: {
        width: 250,   
        height: 250,  
      },
      blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      blurView: {
        flex: 1,
      },
});
