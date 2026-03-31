import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    totalSavingData: null,
    vendorTypeData: "Restaurant"
}

const totalSavingSlice = createSlice({
    name: "TotalSaving",
    initialState: initialState,
    reducers: {
        totalSavingReducer: (state, action) => {
            const { type, payload } = action;
            state.totalSavingData = payload;
        },
        setVendorTypeData:(state, action) => {
            const { type, payload } = action;
            state.vendorTypeData = payload;
        }
    }
})

export const { totalSavingReducer, setVendorTypeData } = totalSavingSlice.actions;
export default totalSavingSlice.reducer;