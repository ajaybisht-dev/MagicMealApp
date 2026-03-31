import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  Easing,
} from "react-native";

interface ToggleProps {
  initial?: boolean;
  onToggle?: (value: boolean) => void;
}

const AnimatedToggle: React.FC<ToggleProps> = ({ initial = false, onToggle }) => {
  const [isOn, setIsOn] = useState(initial);

  const anim = useRef(new Animated.Value(initial ? 1 : 0)).current;
  const toggleSwitch = () => {
    const newValue = !isOn;
    setIsOn(newValue);

    Animated.timing(anim, {
      toValue: newValue ? 1 : 0,
      duration: 250,
      easing: Easing.out(Easing.circle),
      useNativeDriver: false,
    }).start();

    onToggle?.(newValue);
  };

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 24],
  });

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#C7C7C7", "#DDFFDE"],
  });

  return (
    <Pressable onPress={toggleSwitch}>
      <Animated.View style={[styles.toggleContainer, { backgroundColor, borderWidth :1, borderColor : isOn ? "#264941" : "transparent" }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX }], backgroundColor : isOn ? "#264941" : "#fff" }]} />
      </Animated.View>
    </Pressable>
  );
};

export default AnimatedToggle;

const styles = StyleSheet.create({
  toggleContainer: {
    width: 49,
    height: 25,
    borderRadius: 20,
    justifyContent: "center",
  },
  knob: {
    width: 23,
    height: 23,
    borderRadius: 15,
    backgroundColor: "#264941",
  },
});