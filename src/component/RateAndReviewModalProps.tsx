import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Icons } from "../theme/AssetsUrl";

interface RateAndReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    quality: number;
    quantity: number;
    taste: number;
    comment: string;
  }) => void;
}

const RateAndReviewModal: React.FC<RateAndReviewModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [quality, setQuality] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [taste, setTaste] = useState(0);
  const [comment, setComment] = useState("");

  const renderStars = (rating: number, setRating: (r: number) => void) => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((num) => (
        <Pressable key={num} onPress={() => setRating(num)}>
          <Image
            source={Icons.CheckIcon}
            style={[
              styles.star,
              { tintColor: num <= rating ? "#FFC107" : "#C0C0C0" },
            ]}
            resizeMode="contain"
          />
        </Pressable>
      ))}
    </View>
  );

  const handleSubmit = () => {
    onSubmit({ quality, quantity, taste, comment });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={onClose} style = {{display : "flex", flexDirection : "row", alignItems : "center"}}>
            <Image
              source={Icons.ArrowIcon}
              style={{height : 15, width : 15, transform: [{"rotate" : "-90deg"}]}}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Rate & Review This Order</Text>
          </Pressable>

          {/* Ratings */}
          <View style={styles.ratingSection}>
            <Text style={styles.label}>Quality:</Text>
            {renderStars(quality, setQuality)}

            <Text style={styles.label}>Quantity:</Text>
            {renderStars(quantity, setQuantity)}

            <Text style={styles.label}>Taste:</Text>
            {renderStars(taste, setTaste)}
          </View>

          {/* Comment */}
          <Text style={styles.commentLabel}>Comment (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Write your comment..."
            placeholderTextColor="#888"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />

          {/* Submit */}
          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>SUBMIT</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default RateAndReviewModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 30,
    maxHeight: "85%",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginLeft : 5
  },
  ratingSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: "#444",
    marginVertical: 8,
  },
  starContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  star: {
    height: 25,
    width: 25,
    marginRight: 8,
  },
  commentLabel: {
    fontSize: 15,
    color: "#444",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    height: 90,
    textAlignVertical: "top",
    marginBottom: 25,
    color: "#333",
  },
  submitButton: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    alignSelf: "center",
    width: "60%",
  },
  submitText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
});
