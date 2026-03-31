import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    userProfileData: null,
    notificationData: null
}

const userProfileSlice = createSlice({
    name: "TotalSaving",
    initialState: initialState,
    reducers: {
        userDataReducer: (state, action) => {
            const { type, payload } = action;
            state.userProfileData = payload;
        },
        notficationDataReducer: (state, action) => {
            const { type, payload } = action;
            state.notificationData = payload;
        }
    }
})

export const { userDataReducer, notficationDataReducer } = userProfileSlice.actions;
export default userProfileSlice.reducer;