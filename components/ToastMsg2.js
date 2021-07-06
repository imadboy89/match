import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { View, Pressable } from 'react-native';
import React from 'react';

export default function AnimatedStyleUpdateExample(props) {
  const offset = useSharedValue(0);

  const customSpringStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(offset.value, {
            damping: 7,
            stiffness: 100,
          }),
        },
      ],
    };
  });
  setTimeout(() => {
    offset.value = props.transofr_y ;
  }, 100);
  return (
      <Animated.View style={[props.dynamic_style.box,{height : props.height?props.height:70}, customSpringStyles]} >
          <Pressable
            hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
            style={props.dynamic_style.box_inside}
            activeOpacity={0.7}
            onPress={()=>{
              offset.value = 0 ;
              setTimeout(() => {
                props.closeModal();
              }, 1000);
            }}
          >
            <Text style={[props.dynamic_style.body, props.text_style]}>{props.body}</Text>
            <View style={[props.dynamic_style.indecator,props.indecator_style]}></View>
          </Pressable>
          </Animated.View>
  );
}