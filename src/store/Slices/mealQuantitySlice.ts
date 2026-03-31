import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

interface MealState {
  mealData: any[];
  actualPrice: number;
  discountPrice: number;
  surpriseBoxIdImage: any[]
}

const initialState: MealState = {
  mealData: [],
  actualPrice: 0,
  discountPrice: 0,
  surpriseBoxIdImage: []
};

const mealQuantitySlice = createSlice({
  name: "Quantity",
  initialState,
  reducers: {
    setMealDataList: (state, action) => {
      if (!action.payload || action.payload.length === 0) {
        state.mealData = [];
        AsyncStorage.setItem("CartDataArray", JSON.stringify([]));
        return;
      }
      const merged = [...state.mealData, ...action.payload];
      let data = [
        ...new Map(
          merged.map(item => [item.surpriseBoxID, item])
        ).values()
      ];
      const modifiedData = data.map((item: any) => ({
        ...item,
        incLoading: false,
        decLoading: false,
      }));
      state.mealData = modifiedData
      AsyncStorage.setItem("CartDataArray", JSON.stringify(modifiedData));
    },
    setActualPrice: (state, action) => {
      state.actualPrice = action.payload;
    },
    setDiscountPrice: (state, action) => {
      state.discountPrice = action.payload;
    },
    setSurpriseBoxImage: (state, action) => {
      let data = [...state.surpriseBoxIdImage, ...action.payload];

      data = data.filter(
        (item, index, self) =>
          index === self.findIndex(x => x.surpriseBoxID === item.surpriseBoxID)
      );

      // console.log("action.payload", action.payload);
      // console.log("Final unique count:", data);

      state.surpriseBoxIdImage = data;
    },

  },
});

export const { setMealDataList, setActualPrice, setDiscountPrice, setSurpriseBoxImage } = mealQuantitySlice.actions;
export default mealQuantitySlice.reducer;
