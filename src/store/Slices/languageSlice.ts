import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    selected_language: "en"
}

const languageSlice = createSlice({
    name: "Language",
    initialState: initialState,
    reducers: {
        languageReducer: (state, action) => {
            const { type, payload } = action;            
            state.selected_language = payload;
        }
    }
})

export const { languageReducer } = languageSlice.actions;
export default languageSlice.reducer;