import { createSlice } from "@reduxjs/toolkit"

const initialState = {};

const conversationsSlice = createSlice({
    name: 'conversations',
    initialState,
    reducers:{
        test : () => {}
    }
})

export const{test} = conversationsSlice.actions
export default conversationsSlice.reducer