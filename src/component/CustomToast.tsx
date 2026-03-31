import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fontPixel } from '../utils/responsive';
import { FONTS } from '../theme/FontsLink';

interface CustomToastProps {
  message: string;
  isSuccess: boolean
}

const CustomToast: React.FC<CustomToastProps> = ({ message, isSuccess }) => {
  return (
    <View style={[styles.toastContainer, { backgroundColor: isSuccess ? "#0FB12E" : "#D71D27" }]}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

export default CustomToast;

const styles = StyleSheet.create({
  toastContainer: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    width: "100%"
  },
  toastText: {
    color: '#fff',
    fontSize: fontPixel(14),
    textAlign: 'center',
    fontFamily: FONTS.tenonMediumFont
  },
});