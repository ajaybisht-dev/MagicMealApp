import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    radius: 2,
    address: "",
};

const locationRadiusSlice = createSlice({
    name: "location",
    initialState,
    reducers: {
        setRadiusData: (state, action) => {
            state.radius = action.payload;
        },
        setAddressData: (state, action) => {
            state.address = action.payload;
        },
    },
});

export const { setRadiusData, setAddressData } = locationRadiusSlice.actions;
export default locationRadiusSlice.reducer;