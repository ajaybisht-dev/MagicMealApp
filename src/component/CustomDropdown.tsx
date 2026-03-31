import React, { useState } from "react";
import {
  Modal,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";

const { height } = Dimensions.get("window");

interface CustomDropdownProps {
  label?: string;
  options: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
  selectRadiusText?: string
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  options,
  selectedValue,
  onSelect,
  selectRadiusText
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (value: number) => {
    onSelect(value);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable style={styles.button} onPress={() => setVisible(true)}>
        <Text style={styles.selectedText}>{selectedValue} Km</Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)} />

        <View style={styles.bottomSheet}>
          <View style={styles.handleBar} />
          <Text style={styles.sheetTitle}>{selectRadiusText}</Text>

          <FlatList
            data={options}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  item === selectedValue && { backgroundColor: "#007BFF10" },
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    item === selectedValue && {
                      color: "#007BFF",
                      fontWeight: "600",
                    },
                  ]}
                >
                  {item} Km
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  container: { width: "100%" },
  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  selectedText: { fontSize: 15, color: "#333" },
  arrow: { fontSize: 14, color: "#777" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: height * 0.4,
  },
  handleBar: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
    marginBottom: 12,
  },
  sheetTitle: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 15,
    color: "#333",
    textAlign: "center",
  },
});