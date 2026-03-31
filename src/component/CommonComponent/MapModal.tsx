import React, { FC, ReactNode } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface MapModalProps {
  visible: boolean;
  onClose: () => void;
  children?: ReactNode;
}

const MapModal: FC<MapModalProps> = ({
  visible,
  onClose,
  children,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>

        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <View style={styles.modalContainer}>
          {children}
        </View>

      </View>
    </Modal>
  );
};

export default MapModal;


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000aa",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
  },
});
