import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    filterData: null
};

const filterSlice = createSlice({
    name: "Filter",
    initialState,
    reducers: {
        setFilterData: (state, action) => {
            state.filterData = action.payload;
        },
    },
});

export const { setFilterData } = filterSlice.actions;
export default filterSlice.reducer;