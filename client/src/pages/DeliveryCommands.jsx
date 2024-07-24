import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/deliveryCommands.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

<<<<<<< HEAD
async function fetchAllOrders() {
  try {
    const result = await axios.get("http://localhost:5000/order/all-orders", {
=======
const API_URL = (window.location.host).split(":")[0];
async function fetchAllOrders() {
  try {
    const result = await axios.get(`http://${API_URL}:5000/order/all-orders`, {
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
}

async function FetchArticle(idarticle) {
  try {
<<<<<<< HEAD
    const result = await axios.get(`http://localhost:5000/article/articles/${idarticle}`, {
=======
    const result = await axios.get(`http://${API_URL}:5000/article/articles/${idarticle}`, {
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error(`Error fetching article ${idarticle}:`, error);
    return null;
  }
}

async function FetchRestaurant(idRestaurant) {
  try {
<<<<<<< HEAD
    const result = await axios.get(`http://localhost:5000/restaurant/${idRestaurant}`, {
=======
    const result = await axios.get(`http://${API_URL}:5000/restaurant/${idRestaurant}`, {
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error(`Error fetching restaurant ${idRestaurant}:`, error);
    return null;
  }
}

async function FetchMenu(idMenu) {
  try {
<<<<<<< HEAD
    const result = await axios.get(`http://localhost:5000/menu/${idMenu}`, {
=======
    const result = await axios.get(`http://${API_URL}:5000/menu/${idMenu}`, {
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error(`Error fetching menu ${idMenu}:`, error);
    return null;
  }
}

function DeliveryCommands() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [articles, setArticles] = useState([]);
  const [menus, setMenus] = useState([]);
  const location = useLocation();
  const [languageData, setLanguageData] = useState({});
  const [timers, setTimers] = useState({});

  useEffect(() => {
    async function fetchOrders() {
      try {
        const orders = await fetchAllOrders();
        setOrders(orders);

        const articleIds = orders.flatMap(order =>
          order.Orders?.flatMap(subOrder =>
            subOrder.Articles?.map(article => article.articleId) || []
          ) || []
        );

        const menuIds = orders.flatMap(order =>
          order.Orders?.flatMap(subOrder =>
            subOrder.Menus?.map(menu => menu.menuId) || []
          ) || []
        );

        const orderRestaurantInfo = await Promise.all(
          orders.flatMap(order =>
            order.Orders?.map(subOrder => subOrder.restaurantId) || []
          ).map(async restaurantId => {
            const restaurant = await FetchRestaurant(restaurantId);
            return { id: restaurantId, name: restaurant?.name || 'Unknown' };
          })
        );

        const orderArticleInfo = await Promise.all(
          articleIds.map(async (articleId) => {
            const article = await FetchArticle(articleId);
            return article;
          })
        );

        const orderMenuInfo = await Promise.all(
          menuIds.map(async (menuId) => {
            const menu = await FetchMenu(menuId);
            return menu;
          })
        );

        setRestaurants(orderRestaurantInfo.filter(Boolean));
        setArticles(orderArticleInfo.filter(Boolean));
        setMenus(orderMenuInfo.filter(Boolean));

        // Initialize timers for orders with status "picked up"
        const initialTimers = {};
        orders.forEach(order => {
          if (order.OrderStatus === "picked up") {
            initialTimers[order._id] = { startTime: Date.now(), duration: 30 * 60 * 1000 }; // 30 minutes timer
          }
        });
        setTimers(initialTimers);

      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }

    fetchOrders();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const lang = searchParams.get("lang") || "fr";
    import(`../lang/${lang}.json`)
      .then((data) => {
        setLanguageData(data);
      })
      .catch((error) => {
        console.error("Error loading language file:", error);
      });
  }, [location.search]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const lang = searchParams.get("lang") || "fr";
    import(`../lang/${lang}.json`)
      .then((data) => {
        setLanguageData(data);
      })
      .catch((error) => {
        console.error("Error loading language file:", error);
      });
  }, [location.search]);

  const acceptOrder = async (orderId) => {
    try {
<<<<<<< HEAD
      const response = await axios.put(`http://localhost:5000/order/accept-order/${orderId}`, {}, {
=======
      const response = await axios.put(`http://${API_URL}:5000/order/accept-order/${orderId}`, {}, {
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.data.success) {
        window.location.reload(); // Refresh the page to reflect changes
      } else {
        console.error(response.data.message);
        window.location.reload(); // Refresh the page to reflect changes
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      window.location.reload(); // Refresh the page to reflect changes
    }
  };

  const rejectOrder = async (orderId) => {
    try {
<<<<<<< HEAD
      const response = await axios.put(`http://localhost:5000/order/reject-order/${orderId}`, {}, {
=======
      const response = await axios.put(`http://${API_URL}:5000/order/reject-order/${orderId}`, {}, {
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.data.success) {
        window.location.reload(); // Refresh the page to reflect changes
      } else {
        console.error(response.data.message);
        window.location.reload(); // Refresh the page to reflect changes
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      window.location.reload(); // Refresh the page to reflect changes
    }
  };

  const setPickedUp = async (orderId) => {
    try {
<<<<<<< HEAD
      const response = await axios.put(`http://localhost:5000/order/${orderId}/status`, { OrderStatus: "picked up" }, {
=======
      const response = await axios.put(`http://${API_URL}:5000/order/${orderId}/status`, { OrderStatus: "picked up" }, {
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.data.message) {
        setTimers(prevTimers => ({
          ...prevTimers,
          [orderId]: { startTime: Date.now(), duration: 30 * 60 * 1000 } // 30 minutes timer
        }));
        window.location.reload(); // Refresh the page to reflect changes
      } else {
        console.error(response.data.error);
        window.location.reload(); // Refresh the page to reflect changes
      }
    } catch (error) {
      console.error('Error updating order status to picked up:', error);
      window.location.reload(); // Refresh the page to reflect changes
    }
  };

  const setDelivered = async (orderId) => {
    try {
<<<<<<< HEAD
      const response = await axios.put(`http://localhost:5000/order/${orderId}/status`, { OrderStatus: "delivered" }, {
=======
      const response = await axios.put(`http://${API_URL}:5000/order/${orderId}/status`, { OrderStatus: "delivered" }, {
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.data.message) {
        window.location.reload(); // Refresh the page to reflect changes
      } else {
        console.error(response.data.error);
        window.location.reload(); // Refresh the page to reflect changes
      }
    } catch (error) {
      console.error('Error updating order status to delivered:', error);
      window.location.reload(); // Refresh the page to reflect changes
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        const newTimers = { ...prevTimers };
        Object.keys(newTimers).forEach(orderId => {
          const timeLeft = newTimers[orderId].startTime + newTimers[orderId].duration - Date.now();
          if (timeLeft <= 0) {
            delete newTimers[orderId];
          } else {
            newTimers[orderId].timeLeft = timeLeft;
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="wrapper">
      <h3>{languageData.Commandes || 'Orders'}</h3>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <div>
            <h4>All Orders</h4>
            {orders
              .map((order, index) => (
                <div key={index} className="ticket-wrap">
                  <div className="ticket">
                    <div className="ticket__header">
                      <div className="ticket__co">
                        <svg className="ticket__co-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
                          <circle fill="#506072" cx="32" cy="32" r="32" />
                        </svg>
                        <span className="ticket__co-name">Order {index + 1}</span>
                        <span className="u-upper ticket__co-subname"> {order._id}</span>
                      </div>
                    </div>
                    <div className="ticket__body">
                      <div className="ticket__timing">
                        <p>
                          <span className="u-upper ticket__small-label">Order Address</span>
                          <span className="ticket__detail">{order.orderaddress}</span>
                        </p>
                        <p>
                          <span className="u-upper ticket__small-label">Order Phone</span>
                          <span className="ticket__detail">{order.orderPhone}</span>
                        </p>
                        <p>
                          <span className="u-upper ticket__small-label">Order Price</span>
                          <span className="ticket__detail">{order.OrderPrice}</span>
                        </p>
                        <p>
                          <span className="u-upper ticket__small-label">Order Status</span>
                          <span className="ticket__detail">{order.OrderStatus}</span>
                        </p>
                      </div>
                      <div className="ticket__fine-print">
                        <h6>Sub Orders:</h6>
                        {order.Orders && order.Orders.length > 0 ? (
                          order.Orders.map((subOrder, subIndex) => (
                            <div key={subIndex}>
                              <h6>Sub Order: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'Unknown'}</h6>
                              <p>Restaurant Name: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'Unknown'}</p>
                              <p>Sub Order Price: {subOrder.OrderPrice}</p>
                              <p>Sub Order Status: {subOrder.OrderStatus}</p>
                              {subOrder.Menus && subOrder.Menus.length > 0 && (
                                <>
                                  <h6>Menus:</h6>
                                  {subOrder.Menus.map((menu, menuIndex) => (
                                    <div key={menuIndex}>
                                      <p>Menu Name: {menus.find(item => item._id === menu.menuId)?.name || 'Unknown'}</p>
                                      <p>Menu Price: {menus.find(item => item._id === menu.menuId)?.price || 'Unknown'}</p>
                                      <p>Quantity: {menu.quantityMenu}</p>
                                      <h6>Menu Articles:</h6>
                                      {menus.find(item => item._id === menu.menuId)?.articles.map((menuArticle, menuArticleIndex) => (
                                        <div key={menuArticleIndex}>
                                          <p>Article Name: {menuArticle?.name || 'Unknown'}</p>
                                          <p>Article Price: {menuArticle?.price || 'Unknown'}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </>
                              )}
                              {subOrder.Articles && subOrder.Articles.length > 0 && (
                                <>
                                  <h6>Articles:</h6>
                                  {subOrder.Articles.map((article, articleIndex) => (
                                    <div key={articleIndex}>
                                      <p>Article Name: {articles.find(item => item._id === article.articleId)?.name || 'Unknown'}</p>
                                      <p>Article Price: {articles.find(item => item._id === article.articleId)?.price || 'Unknown'}</p>
                                      <p>Quantity: {article.quantity}</p>
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                          ))
                        ) : (
                          <p>No sub-orders found.</p>
                        )}
                      </div>
                      {order.OrderStatus === 'payé' ? (
                        <div>
                          <button onClick={() => acceptOrder(order._id)}>Accept Order</button>
                          <button onClick={() => rejectOrder(order._id)}>Reject Order</button>
                        </div>
                      ) : (
                        <p>Delivery Person Assigned: {order.DeliveryPersonId}</p>
                      )}
                      {order.OrderStatus === 'accepted by deliveryPerson' && (
                        <button onClick={() => setPickedUp(order._id)}>Set as Picked Up</button>
                      )}
                      {order.OrderStatus === 'picked up' && (
                        <div>
                          <button onClick={() => setDelivered(order._id)}>Set as Delivered</button>
                          {timers[order._id] && (
                            <div style={{ width: "100px", height: "100px", margin: "0 auto" }}>
                              <CircularProgressbar
                                value={Math.max(0, (timers[order._id].timeLeft / timers[order._id].duration) * 100)}
                                text={`${Math.floor(Math.max(0, timers[order._id].timeLeft / 1000 / 60))}m ${Math.floor(Math.max(0, (timers[order._id].timeLeft / 1000) % 60))}s`}
                                styles={buildStyles({
                                  textSize: '16px',
                                  pathColor: `rgba(62, 152, 199, ${Math.max(0, timers[order._id].timeLeft / timers[order._id].duration)})`,
                                  textColor: '#f88',
                                  trailColor: '#d6d6d6',
                                })}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      <img className="ticket__barcode" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/515428/barcode.png" alt="Fake barcode" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

export default DeliveryCommands;
