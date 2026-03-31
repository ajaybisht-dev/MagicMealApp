import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    vendor_types: [],
    meals_types: [],
    platform_fees: 0
};

const ventorAndMealSlice = createSlice({
    name: "ventorAndMealaType",
    initialState,
    reducers: {
        setVendorData: (state, action) => {
            state.vendor_types = action.payload;
        },
        setMealData: (state, action) => {
            state.meals_types = action.payload;
        },
        setPlatFormFeesData: (state, action) => {
            state.platform_fees = action.payload;
        },
    },
})

export const { setVendorData, setMealData, setPlatFormFeesData } = ventorAndMealSlice.actions;
export default ventorAndMealSlice.reducer;