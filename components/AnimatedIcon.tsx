import { Ionicons } from '@expo/vector-icons';
import { SFSymbol, SymbolView } from 'expo-symbols';
import React, { ComponentProps } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';


const CONTAINER_PADDING = 0;
const CONTAINER_WIDTH = 74;
const ICON_SIZE = 75;

interface AnimatedButtonProps {
    iosName: SFSymbol;
    androidName: ComponentProps<typeof Ionicons>['name'];
    containerStyle?: StyleProp<ViewStyle>;
    onPress: () => void;
    width?: number;
    height?: number;
}

export default function AnimatedButton({
   androidName,
    iosName,
    containerStyle,
    onPress,
    width,
    height 
}: AnimatedButtonProps) {
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
      
       <Animatable.View 
       onPress={onPress}
      animation="pulse" // try "bounce" for bounce effect
      iterationCount="infinite"
      duration={1500}
      easing="ease-in-out"
    >
        {/* <Text style={styles.buttonText}>Click Me</Text> */}
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
       </Animatable.View>
     
      </TouchableOpacity>
  
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
