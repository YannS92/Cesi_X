import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slice/userSlice";
import restaurantReducer from "./slice/restaurantSlice";
import articleReducer from './slice/articleSlice';
import menuReducer from "./slice/menuSlice";
import deliveryPersonReducer from "./slice/deliveryPersonSlice"; // Import the deliveryPerson reducer

export const store = configureStore({
  reducer: {
    user: userSlice,
    restaurant: restaurantReducer,
    article: articleReducer,
    menu: menuReducer,
    deliveryPerson: deliveryPersonReducer,
  },
});
