import axios from "axios";
const REACT_APP_API_URL = "http://localhost:5000";

export default class Order {
    constructor(orderData) {
        this.initialize(orderData);
    }

 async initialize(orderData) {
        try {
            const result = await Order.addOrderUsingRoute(orderData);
            this.orderId = result._id;
            this.orderaddress = result.orderaddress;
            this.orderPhone = result.orderPhone;
            this.userId = result.userId;
            this.DeliveryPersonId = result.DeliveryPersonId;
            this.orders = result.Orders;
            this.OrderStatus = result.OrderStatus;
            this.OrderPrice = result.OrderPrice;
            this.OriginalOrderPrice = result.OriginalOrderPrice;
            this.DiscountApplied = result.DiscountApplied;
            this.initialized = true;
        } catch (error) {
            throw error;
        }
 }
    checkInitialization() {
        if (!this.initialized) {
            throw new Error('Order not initialized yet');
        }
    }

    getOrderId() {
        this.checkInitialization();
        return this.orderId;
    }

    getorderaddress() {
        this.checkInitialization();
        return this.orderaddress;
    }

    async remove() {
        try {
            this.checkInitialization();
            const apiurl = REACT_APP_API_URL;
            const result = await axios.delete(`${apiurl}/order/${this.getOrderId()}`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            console.log(result);
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
        }
    }

    async addArticle(articleId, quantity) {
        try {
            const apiurl = REACT_APP_API_URL;
            const requestData = { quantity };
            const result = await axios.post(`${apiurl}/order/${this.getOrderId()}/article/${articleId}`, requestData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            return result;
        } catch (error) {
            console.error('Error adding article to order:', error);
            throw error;
        }
    }

    async removeArticle(articleId) {
        try {
            const apiurl = REACT_APP_API_URL;
            const result = await axios.delete(`${apiurl}/order/${this.getOrderId()}/article/${articleId}`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            return result;
        } catch (error) {
            console.error('Error deleting article from order:', error);
            throw error;
        }
    }

    async addMenu(menuId, quantityMenu, articles) {
        try {
            const apiurl = REACT_APP_API_URL;
            const requestData = {
                quantityMenu,
                articles: articles.map(article => ({
                    articleId: article.id,
                    quantity: article.quantity * quantityMenu
                }))
            };
            const result = await axios.post(`${apiurl}/order/${this.getOrderId()}/menu/${menuId}`, requestData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            return result;
        } catch (error) {
            console.error('Error adding menu to order:', error);
            throw error;
        }
    }

    
    async assignDeliveryPerson(deliveryPersonId) {
        this.checkInitialization();
        try {
            const apiurl = REACT_APP_API_URL;
            const requestData = { DeliveryPersonId: deliveryPersonId };
            const result = await axios.put(`${apiurl}/order/assign-delivery-person/${this.getOrderId()}`, requestData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            this.DeliveryPersonId = deliveryPersonId;
            return result.data;
        } catch (error) {
            console.error('Error assigning delivery person to order:', error);
            throw error;
        }
    }
    
      static async addOrderUsingRoute(orderData) {
        try {
            const apiurl = REACT_APP_API_URL;
            const idOrders = await this.getCurrentUserOrders();

            if (idOrders.length > 0) {
                for (const orderId of idOrders) {
                    const result = await axios.get(`${apiurl}/order/${orderId}`, {
                        headers: {
                            Authorization: localStorage.getItem("token"),
                        },
                    });

                    if (result.data.OrderStatus === "en cours") {
                        for (const article of orderData.Articles) {
                            await this.StaticAddArticle(orderId, article.articleId, article.quantity);
                        }
                        for (const menu of orderData.Menus) {
                            await this.StaticAddMenu(orderId, menu.menuId, menu.quantityMenu, menu.Articles);
                        }
                        return result.data;
                    }
                }
            }

            const result = await axios.post(`${apiurl}/order/add`, orderData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            return result.data.order;

        } catch (error) {
            console.error('Error adding order using route:', error);
            throw error;
        }
    }
    /***************************** Static functions ******************************/
    static async getCurrentUserOrders() {
        try {
            const apiurl = REACT_APP_API_URL;
            const result = await axios.get(`${apiurl}/user/current`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            const orders = result.data.user.orders;
            const orderIds = orders.map(order => order);
            return orderIds;
        } catch (error) {
            console.error('Error fetching current user orders:', error);
            throw error;
        }
    }

    static async StaticAddArticle(orderId, articleId, quantity) {
        try {
            const apiurl = REACT_APP_API_URL;
            const requestData = { quantity };
            const result = await axios.post(`${apiurl}/order/${orderId}/article/${articleId}`, requestData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            return result;
        } catch (error) {
            console.error('Error adding article to order:', error);
            throw error;
        }
    }

    static async StaticAddMenu(orderId, menuId, quantityMenu, articles) {
        try {
            const apiurl = REACT_APP_API_URL;
            const requestData = {
                quantityMenu,
                articles: articles.map(article => ({
                    articleId: article.articleId,
                    quantity: article.quantity
                }))
            };
            const result = await axios.post(`${apiurl}/order/${orderId}/menu/${menuId}`, requestData, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            return result;
        } catch (error) {
            console.error('Error adding menu to order:', error);
            throw error;
        }
    }
}
