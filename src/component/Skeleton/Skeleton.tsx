import React, { FC } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

const Skeleton: FC = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 10, paddingBottom : 70 }}>
      <View style={styles.topRow}>
        <View style={styles.topCard} />
        <View style={styles.topCard} />

      </View>
      <View style={[styles.lineBig, { width: 120, marginTop: 20 }]} />
      {[1, 2].map((_, index) => (
        <View key={index} style={styles.offerCard}>
          <View style={styles.bagBox} />

          <View style={{ flex: 1, marginLeft: 15 }}>
            <View style={[styles.lineBig, { width: "55%" }]} />
            <View style={[styles.lineSmall, { width: "40%", marginTop: 5 }]} />
            <View style={[styles.lineSmall, { width: "60%", marginTop: 12 }]} />
            <View style={[styles.lineSmall, { width: "45%", marginTop: 14 }]} />
            <View style={[styles.lineSmall, { width: "50%", marginTop: 10 }]} />
          </View>
          <View style={styles.rightSide}>
            <View style={[styles.lineSmall, { width: 60 }]} />
            <View style={[styles.lineSmall, { width: 40, height: 18, marginTop: 10 }]} />
          </View>
        </View>
      ))}

    </ScrollView>
  );
};

export default Skeleton;

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  topCard: {
    width: "48%",
    height: 220,
    backgroundColor: "#E6E6E6",
    borderRadius: 12,
  },
  offerCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#D6D6D6"
  },
  bagBox: {
    width: 60,
    height: 60,
    backgroundColor: "#E6E6E6",
    borderRadius: 12,
  },
  lineSmall: {
    height: 12,
    backgroundColor: "#E6E6E6",
    borderRadius: 6,
  },
  lineBig: {
    height: 18,
    backgroundColor: "#E6E6E6",
    borderRadius: 6,
  },

  rightSide: {
    marginLeft: 10,
    alignItems: "flex-end",
    justifyContent: "center",
  },
});