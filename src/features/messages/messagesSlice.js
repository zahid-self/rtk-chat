import { createSlice } from "@reduxjs/toolkit"

const initialState = {};

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers:{
        test : () => {}
    }
})

export const{test} = messagesSlice.actions
export default messagesSlice.reducer