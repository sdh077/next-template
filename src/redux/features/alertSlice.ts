import { createSlice } from "@reduxjs/toolkit";

interface Alert {
  id: number
  alertType: number;
  content: any;
  timeout: number
}
const initialState: Alert[] = []

export const alert = createSlice({
  name: "alert",
  initialState,
  reducers: {
    openAlert: (state, actions) => {
      const { alertType, content, timeout } = actions.payload;
      state.push({ id: Date.now(), alertType, content, timeout: timeout ?? 1000 })
    },
    closeAlert: (state) => {
      state.shift();
    },
  },
});

export const { openAlert, closeAlert } = alert.actions;
export const selectAlert = (state) => state.alert;

export default alert.reducer;