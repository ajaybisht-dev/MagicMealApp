import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    logoutMessage: null,
    accountDeleteMessage: null,
};

const logoutSlice = createSlice({
    name: "Filter",
    initialState,
    reducers: {
        setLogoutData: (state, action) => {
            state.logoutMessage = action.payload;
        },
        setAccountDeleteData: (state, action) => {
            state.accountDeleteMessage = action.payload;
        },
    },
});

export const { setLogoutData, setAccountDeleteData } = logoutSlice.actions;
export default logoutSlice.reducer;