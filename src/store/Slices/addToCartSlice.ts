import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
    surpriseBoxID: string | number;
    quantity: number;
    unitPrice: number,
    surpriseBoxName: string,
    discountedPrice: string | number,
    actualPrice: string | number,
    sbImageURL: string,
    noOfBoxRemaing: number,
    surpriseBoxMealType: any
}

interface CartState {
    add_to_cart: CartItem[];
    api_cart_data: [];
    complete_data: [];
    cartLength: 0
}

const initialState: CartState = {
    add_to_cart: [],
    api_cart_data: [],
    complete_data: [],
    cartLength: 0
};

const addToCartSlice = createSlice({
    name: "addToCart",
    initialState,
    reducers: {
        addToCartReducer: (state, action: PayloadAction<CartItem>) => {
            const payload = action.payload;
            const id = payload.surpriseBoxID;
            if (payload.quantity === 0) {
                state.add_to_cart = state.add_to_cart.filter(
                    item => item.surpriseBoxID !== id
                );
                // console.log("CART:", JSON.stringify(state.add_to_cart));
                return;
            }
            const index = state.add_to_cart.findIndex(
                item => item.surpriseBoxID === id
            );

            if (index !== -1) {
                state.add_to_cart[index] = payload;
            } else {
                state.add_to_cart.push(payload);
            }

            // console.log("CART:", JSON.stringify(state.add_to_cart));
        },
        addApiCartReducer: (state, action) => {
            const modifiedData = action.payload.map((item: any) => ({
                ...item,
                incLoading: false,
                decLoading: false,
            }));
            state.api_cart_data = modifiedData;
            AsyncStorage.setItem("CartDataArray", JSON.stringify(modifiedData));
        },
        completeDataCartReducer: (state, action) => {
            state.complete_data = action.payload;
        },
    },
});

export const { addToCartReducer, addApiCartReducer, completeDataCartReducer } = addToCartSlice.actions;
export default addToCartSlice.reducer;