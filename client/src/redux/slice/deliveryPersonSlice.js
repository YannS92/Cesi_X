import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const API_URL = (window.location.host).split(":")[0];
// Thunk to fetch all delivery persons
export const fetchAllDeliveryPersons = createAsyncThunk(
  'deliveryPerson/fetchAll',
  async (_, thunkAPI) => {
    const response = await axios.get(`http://${API_URL}:5000/deliveryPerson/all`, {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    });
    return response.data;
  }
);

// Thunk to fetch delivery person by user ID
export const fetchDeliveryPersonByUserId = createAsyncThunk(
  'deliveryPerson/fetchByUserId',
  async (userId, thunkAPI) => {
    const response = await axios.get(`http://${API_URL}:5000/deliveryPerson/user/${userId}`, {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    });
    return response.data;
  }
);

// Thunk to update delivery person availability
export const updateDeliveryPersonAvailability = createAsyncThunk(
  'deliveryPerson/updateAvailability',
  async ({ id, available }, thunkAPI) => {
    const response = await axios.put(`http://${API_URL}:5000/deliveryPerson/update/${id}`, { available }, {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    });
    return response.data;
  }
);

const deliveryPersonSlice = createSlice({
  name: 'deliveryPerson',
  initialState: {
    deliveryPersons: [],
    deliveryPerson: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDeliveryPersons.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllDeliveryPersons.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.deliveryPersons = action.payload;
      })
      .addCase(fetchAllDeliveryPersons.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchDeliveryPersonByUserId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDeliveryPersonByUserId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.deliveryPerson = action.payload;
      })
      .addCase(fetchDeliveryPersonByUserId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateDeliveryPersonAvailability.fulfilled, (state, action) => {
        if (state.deliveryPerson) {
          state.deliveryPerson.available = action.payload.available;
        }
      });
  },
});

export default deliveryPersonSlice.reducer;
