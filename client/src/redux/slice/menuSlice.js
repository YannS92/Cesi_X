import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
const API_URL = (window.location.host).split(":")[0];
// Fetch all menus for a restaurant
export const fetchMenusByRestaurantId = createAsyncThunk("menu/fetchMenusByRestaurantId", async (restaurantId) => {
    const response = await axios.get(`http://${API_URL}:5000/menu/restaurant/${restaurantId}`);
    return response.data;
});

// Fetch menu by ID
export const fetchMenuById = createAsyncThunk("menu/fetchMenuById", async (id) => {
    const response = await axios.get(`http://${API_URL}:5000/menu/${id}`);
    return response.data;
});

// Add new menu
export const createMenu = createAsyncThunk("menu/createMenu", async (newMenu) => {
    try {
        let result = await axios.post(`http://${API_URL}:5000/menu/`, newMenu, {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        });
        return result.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
});

// Update menu
export const updateMenu = createAsyncThunk("menu/updateMenu", async ({ id, menuData }) => {
    try {
        let result = await axios.put(`http://${API_URL}:5000/menu/${id}`, menuData, {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        });
        return result.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
});

// Delete menu
export const deleteMenu = createAsyncThunk("menu/deleteMenu", async (id) => {
    try {
        await axios.delete(`http://${API_URL}:5000/menu/${id}`, {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        });
        return id;
    } catch (error) {
        console.log(error);
        throw error;
    }
});

const initialState = {
    menus: [],
    menu: null,
    restaurantMenus: [],
    status: null,
    error: null,
};

const menuSlice = createSlice({
    name: "menu",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMenusByRestaurantId.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchMenusByRestaurantId.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.restaurantMenus = action.payload;
            })
            .addCase(fetchMenusByRestaurantId.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(fetchMenuById.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchMenuById.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.menu = action.payload;
            })
            .addCase(fetchMenuById.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(createMenu.pending, (state) => {
                state.status = "loading";
            })
            .addCase(createMenu.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.menus.push(action.payload);
            })
            .addCase(createMenu.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(updateMenu.pending, (state) => {
                state.status = "loading";
            })
            .addCase(updateMenu.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.menus.findIndex((menu) => menu._id === action.payload._id);
                if (index !== -1) {
                    state.menus[index] = action.payload;
                }
            })
            .addCase(updateMenu.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(deleteMenu.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteMenu.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.menus = state.menus.filter((menu) => menu._id !== action.payload);
            })
            .addCase(deleteMenu.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export default menuSlice.reducer;
