import React, { FC } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

const OfferItemSkeleton: FC = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>

      <View style={[styles.lineBig, { width: 80, marginTop: 10 }]} />
      {[1, 2, 3, 4].map((_, index) => (
        <View
          key={index}
          style={[styles.card]}
        >
          <View style={styles.bagIcon} />

          <View style={styles.middleContent}>
            <View style={[styles.lineBig, { width: "55%" }]} />
            <View style={[styles.lineSmall, { width: "45%", marginTop: 8 }]} />
            <View style={[styles.lineSmall, { width: "40%", marginTop: 10 }]} />
          </View>

        </View>
      ))}

    </ScrollView>
  );
};

export default OfferItemSkeleton;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingBottom : 70
  },

  card: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "#DDDDDD",
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#FFF",
    marginTop: 15,
  },

  bagIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#E6E6E6",
    borderRadius: 10,
  },

  middleContent: {
    flex: 1,
    marginLeft: 12,
  },

  lineBig: {
    height: 16,
    backgroundColor: "#E6E6E6",
    borderRadius: 6,
  },

  lineSmall: {
    height: 12,
    backgroundColor: "#E6E6E6",
    borderRadius: 6,
  }
});