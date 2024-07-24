import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
const API_URL = (window.location.host).split(":")[0];
// Fetch all articles
export const fetchAllArticles = createAsyncThunk("article/fetchAllArticles", async () => {
    const response = await axios.get(`http://${API_URL}:5000/article/all`);
    return response.data;
});

// Fetch article by ID
export const fetchArticlesByIds = createAsyncThunk('article/fetchByIds', async (ids) => {
    try {
        const articles = [];
        for (const id of ids) {
            const response = await axios.get(`http://${API_URL}:5000/article/articles/${id}`);
            articles.push(response.data);
        }
        return articles;
    } catch (error) {
        // Gérer les erreurs ici
        console.error('Error fetching articles by IDs:', error);
        throw error;
    }
});


// Fetch all articles for a restaurant
export const fetchArticlesByRestaurantId = createAsyncThunk("article/fetchArticlesByRestaurantId", async (restaurantId) => {
    const response = await axios.get(`http://${API_URL}:5000/article/restaurant/${restaurantId}`);
    return response.data;
});

// Add new article
export const addArticle = createAsyncThunk("article/addArticle", async (newArticle) => {
    try {
        let result = await axios.post(`http://${API_URL}:5000/article/add`, newArticle, {
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

// Update article
export const updateArticle = createAsyncThunk("article/updateArticle", async ({ id, articleData }) => {
    try {
        let result = await axios.put(`http://${API_URL}:5000/article/${id}`, articleData, {
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

// Delete article
export const deleteArticle = createAsyncThunk("article/deleteArticle", async (id) => {
    try {
        await axios.delete(`http://${API_URL}:5000/article/${id}`, {
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

// Upload article image
export const uploadArticleImage = createAsyncThunk("article/uploadArticleImage", async ({ id, formData }) => {
    try {
        const result = await axios.post(`http://${API_URL}:5000/article/upload-image/${id}`, formData, {
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

const initialState = {
    articles: [],
    restaurantArticles: [],
    article: null,
    status: null,
    error: null,
};

const articleSlice = createSlice({
    name: "article",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllArticles.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchAllArticles.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.articles = action.payload;
            })
            .addCase(fetchAllArticles.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(fetchArticlesByIds.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchArticlesByIds.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.articles = action.payload;
            })
            .addCase(fetchArticlesByIds.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchArticlesByRestaurantId.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchArticlesByRestaurantId.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.restaurantArticles = action.payload;
            })
            .addCase(fetchArticlesByRestaurantId.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(addArticle.pending, (state) => {
                state.status = "loading";
            })
            .addCase(addArticle.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.articles.push(action.payload);
            })
            .addCase(addArticle.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(updateArticle.pending, (state) => {
                state.status = "loading";
            })
            .addCase(updateArticle.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.articles.findIndex((article) => article._id === action.payload._id);
                if (index !== -1) {
                    state.articles[index] = action.payload;
                }
            })
            .addCase(updateArticle.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(deleteArticle.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteArticle.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.articles = state.articles.filter((article) => article._id !== action.payload);
            })
            .addCase(deleteArticle.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(uploadArticleImage.pending, (state) => {
                state.status = "loading";
            })
            .addCase(uploadArticleImage.fulfilled, (state, action) => {
                state.status = "succeeded";
                const index = state.articles.findIndex((article) => article._id === action.payload.article._id);
                if (index !== -1) {
                    state.articles[index] = action.payload.article;
                }
            })
            .addCase(uploadArticleImage.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export default articleSlice.reducer;
