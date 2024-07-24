import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import axios from "axios";
import "../styles/deliveryCommands.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

async function fetchAllOrders() {
  try {
    const result = await axios.get("http://localhost:5000/order/all-orders", {
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
    const result = await axios.get(`http://localhost:5000/article/articles/${idarticle}`, {
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
    const result = await axios.get(`http://localhost:5000/restaurant/${idRestaurant}`, {
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
    const result = await axios.get(`http://localhost:5000/menu/${idMenu}`, {
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

function AdminOrders() {
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
        <p>{languageData.noOrdersFound || 'No orders found.'}</p>
      ) : (
        <>
          <div>
            <h4>{languageData.allOrders || 'All Orders'}</h4>
            {orders
              .map((order, index) => (
                <div key={index} className="ticket-wrap">
                  <div className="ticket">
                    <div className="ticket__header">
                      <div className="ticket__co">
                        <svg className="ticket__co-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
                          <circle fill="#506072" cx="32" cy="32" r="32" />
                        </svg>
                        <span className="ticket__co-name">{`${languageData.order || 'Order'} ${index + 1}`}</span>
                        <span className="u-upper ticket__co-subname"> {order._id}</span>
                      </div>
                    </div>
                    <div className="ticket__body">
                      <div className="ticket__timing">
                        <p>
                          <span className="u-upper ticket__small-label">{languageData.orderAddress || 'Order Address'}</span>
                          <span className="ticket__detail">{order.orderaddress}</span>
                        </p>
                        <p>
                          <span className="u-upper ticket__small-label">{languageData.orderPhone || 'Order Phone'}</span>
                          <span className="ticket__detail">{order.orderPhone}</span>
                        </p>
                        <p>
                          <span className="u-upper ticket__small-label">{languageData.orderPrice || 'Order Price'}</span>
                          <span className="ticket__detail">{order.OrderPrice}</span>
                        </p>
                        <p>
                          <span className="u-upper ticket__small-label">{languageData.orderStatus || 'Order Status'}</span>
                          <span className="ticket__detail">{order.OrderStatus}</span>
                        </p>
                      </div>
                      <div className="ticket__fine-print">
                        <h6>{languageData.subOrders || 'Sub Orders'}:</h6>
                        {order.Orders && order.Orders.length > 0 ? (
                          order.Orders.map((subOrder, subIndex) => (
                            <div key={subIndex}>
                              <h6>{`${languageData.subOrder || 'Sub Order'}: ${restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'Unknown'}`}</h6>
                              <p>{`${languageData.restaurantName || 'Restaurant Name'}: ${restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'Unknown'}`}</p>
                              <p>{`${languageData.subOrderPrice || 'Sub Order Price'}: ${subOrder.OrderPrice}`}</p>
                              <p>{`${languageData.subOrderStatus || 'Sub Order Status'}: ${subOrder.OrderStatus}`}</p>
                              {subOrder.Menus && subOrder.Menus.length > 0 && (
                                <>
                                  <h6>{languageData.menus || 'Menus'}:</h6>
                                  {subOrder.Menus.map((menu, menuIndex) => (
                                    <div key={menuIndex}>
                                      <p>{`${languageData.menuName || 'Menu Name'}: ${menus.find(item => item._id === menu.menuId)?.name || 'Unknown'}`}</p>
                                      <p>{`${languageData.menuPrice || 'Menu Price'}: ${menus.find(item => item._id === menu.menuId)?.price || 'Unknown'}`}</p>
                                      <p>{`${languageData.quantity || 'Quantity'}: ${menu.quantityMenu}`}</p>
                                      <h6>{languageData.articles || 'Articles'}:</h6>
                                      {menus.find(item => item._id === menu.menuId)?.articles.map((menuArticle, menuArticleIndex) => (
                                        <div key={menuArticleIndex}>
                                          <p>{`${languageData.articleName || 'Article Name'}: ${menuArticle?.name || 'Unknown'}`}</p>
                                          <p>{`${languageData.articlePrice || 'Article Price'}: ${menuArticle?.price || 'Unknown'}`}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </>
                              )}
                              {subOrder.Articles && subOrder.Articles.length > 0 && (
                                <>
                                  <h6>{languageData.articles || 'Articles'}:</h6>
                                  {subOrder.Articles.map((article, articleIndex) => (
                                    <div key={articleIndex}>
                                      <p>{`${languageData.articleName || 'Article Name'}: ${articles.find(item => item._id === article.articleId)?.name || 'Unknown'}`}</p>
                                      <p>{`${languageData.articlePrice || 'Article Price'}: ${articles.find(item => item._id === article.articleId)?.price || 'Unknown'}`}</p>
                                      <p>{`${languageData.quantity || 'Quantity'}: ${article.quantity}`}</p>
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                          ))
                        ) : (
                          <p>{languageData.noSubOrders || 'No sub-orders found.'}</p>
                        )}
                      </div>
                      {order.OrderStatus === 'picked up' && timers[order._id] && (
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

export default AdminOrders;
