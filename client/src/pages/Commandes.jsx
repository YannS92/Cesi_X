import React, { useState, useEffect } from "react";
import jsPDF from 'jspdf';
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom"; 
import axios from "axios";
import "../styles/commandes.css";
import ViewPaymentDialog from "../components/ViewPaymentDialog";
import AWN from "awesome-notifications";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const notifier = new AWN();

const API_URL = (window.location.host).split(":")[0];
async function fetchOrdersByUserRole(user) {
  let orderDetails = [];

  if (user && user.orders) {
    if (!Array.isArray(user.orders)) {
      user.orders = [user.orders];
    }

    for (const orderId of user.orders) {
      try {
        const result = await axios.get(`http://${API_URL}:5000/order/${orderId}`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        orderDetails.push(result.data);
      } catch (error) {
        console.error(`Error fetching order ${orderId}:`, error);
      }
    }
  }

  return orderDetails;
}

async function FetchArticle(idarticle) {
  try {
    const result = await axios.get(`http://${API_URL}:5000/article/articles/${idarticle}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error(`Error fetching article ${idarticle}:`, error);
  }
}

async function FetchMenu(idMenu) {
  try {
    const result = await axios.get(`http://${API_URL}:5000/menu/${idMenu}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error(`Error fetching menu ${idMenu}:`, error);
  }
}

function Commandes() {
  const [orders, setOrders] = useState([]);
  const [articles, setArticles] = useState([]);
  const [menus, setMenus] = useState([]);
  const user = useSelector((state) => state.user?.user);
  const [languageData, setLanguageData] = useState({});
  const location = useLocation();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [timers, setTimers] = useState({});

  useEffect(() => {
    async function fetchOrders() {
      try {
        const orders = await fetchOrdersByUserRole(user);
        setOrders(orders);

        const articleIds = orders.flatMap(order =>
          order.Orders.flatMap(subOrder =>
            subOrder.Articles.map(article => article.articleId)
          )
        );

        const menuIds = orders.flatMap(order =>
          order.Orders.flatMap(subOrder =>
            subOrder.Menus.map(menu => menu.menuId)
          )
        );

        const orderArticleInfo = await Promise.all(
          articleIds.map(async (articleId) => {
            return await FetchArticle(articleId);
          })
        );

        const orderMenuInfo = await Promise.all(
          menuIds.map(async (menuId) => {
            return await FetchMenu(menuId);
          })
        );

        setArticles(orderArticleInfo);
        setMenus(orderMenuInfo);

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
  }, [user?.orders]);

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

  const handleApplyReferral = async (order) => {
    try {
      const response = await axios.post(`http://${API_URL}:5000/order/apply-referral`, {
        orderId: order._id,
        referralCode,
      }, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.data.success) {
        setDiscountedPrice(response.data.discountedPrice);
        notifier.success(languageData.referralCodeApplied || 'Referral code applied successfully!');
      } else {
        notifier.alert(response.data.message);
      }
    } catch (error) {
      console.error('Error applying referral code:', error);
      if (error.response && error.response.data && error.response.data.message) {
        notifier.alert(`${languageData.errorApplyingReferralCode || 'Error applying referral code'}: ${error.response.data.message}`);
      } else {
        notifier.alert(languageData.unexpectedError || 'An error occurred while applying the referral code.');
      }
    }
  };

  const downloadPDF = (order) => {
    const doc = new jsPDF();
    let yOffset = 10;
    doc.text(`Order ${1}`, 10, yOffset);
    yOffset += 10;
    doc.text(`${languageData.orderAddress || 'Order Address'}: ${user.address}`, 10, yOffset);
    yOffset += 10;
    doc.text(`${languageData.orderPhone || 'Order Phone'}: ${user.phoneNumber}`, 10, yOffset);
    yOffset += 10;
    doc.text(`${languageData.orderPrice || 'Order Price'}: ${order.OrderPrice}`, 10, yOffset);
    yOffset += 10;
    doc.text(`${languageData.orderStatus || 'Order Status'}: ${order.OrderStatus}`, 10, yOffset);
    yOffset += 10;

    order.Orders.forEach((subOrder, subIndex) => {
      doc.text(`  Sub Order ${subIndex + 1}`, 10, yOffset);
      yOffset += 10;
      doc.text(`  ${languageData.subOrderPrice || 'Sub Order Price'}: ${subOrder.OrderPrice}`, 10, yOffset);
      yOffset += 10;
      doc.text(`  ${languageData.subOrderStatus || 'Sub Order Status'}: ${subOrder.OrderStatus}`, 10, yOffset);
      yOffset += 10;

      subOrder.Articles.forEach(article => {
        const articleInfo = articles.find(item => item._id === article.articleId);
        doc.text(`    ${languageData.articleName || 'Article Name'}: ${articleInfo ? articleInfo.name : 'N/A'}`, 10, yOffset);
        yOffset += 10;
        doc.text(`    ${languageData.articlePrice || 'Article Price'}: ${articleInfo ? articleInfo.price : 'N/A'}`, 10, yOffset);
        yOffset += 10;
        doc.text(`    ${languageData.quantity || 'Quantity'}: ${article.quantity}`, 10, yOffset);
        yOffset += 10;
      });
    });

    yOffset += 10;

    doc.save('orders.pdf');
  };

  const deleteOrder = async (order) => {
    if (!order) {
      console.error('No order to delete');
      return;
    }
    try {
      const result = await axios.delete(`http://${API_URL}:5000/order/${order._id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      console.log('Order deleted successfully.');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const PayOrder = (order) => {
    setSelectedOrder(order);
    setShowPaymentDialog(true);
  };

  const closePaymentDialog = () => {
    setShowPaymentDialog(false); 
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
        <p>{languageData.noOrdersFound || 'No orders found.'}</p>
      ) : (
        <>
          <div>
            <h4>{languageData.ordersInProgress || 'Orders in Progress'}</h4>
            {orders.map((order, index) => (
              order.OrderStatus === "en cours" && (
                <div key={index} className="order-in-progress">
                  <h5>{`${languageData.order || 'Order'} ${index + 1}`}</h5>
                  <p>{`${languageData.orderID || 'Order ID'}: ${order._id}`}</p>
                  <p>{`${languageData.orderAddress || 'Order Address'}: ${user.address}`}</p>
                  <p>{`${languageData.orderPhone || 'Order Phone'}: ${user.phoneNumber}`}</p>
                  <p>{`${languageData.orderPrice || 'Order Price'}: ${discountedPrice !== null && selectedOrder?._id === order._id ? `${order.OrderPrice} (${languageData.discounted || 'Discounted'}: ${discountedPrice})` : order.OrderPrice}`}</p>
                  <p>{`${languageData.orderStatus || 'Order Status'}: ${order.OrderStatus}`}</p>
                  <h6>{languageData.subOrders || 'Sub Orders'}:</h6>
                  {order.Orders && order.Orders.length > 0 ? (
                    order.Orders.map((subOrder, subIndex) => (
                      <div key={subIndex}>
<<<<<<< HEAD
                        <p>{`${languageData.subOrderPrice || 'Sub Order Price'}: ${subOrder.OrderPrice}`}</p>
=======
                        <p>{`${languageData.subOrderPrice || 'Sub Order Price'}: ${subOrder.OrderPrice.toFixed(2)}`}</p>
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
                        <p>{`${languageData.subOrderStatus || 'Sub Order Status'}: ${subOrder.OrderStatus}`}</p>
                        {subOrder.Menus && subOrder.Menus.length > 0 && (
                          <>
                            <h6>{languageData.menus || 'Menus'}:</h6>
                            {subOrder.Menus.map((menu, menuIndex) => (
                              <div key={menuIndex}>
                                <p>{`${languageData.menuName || 'Menu Name'}: ${menus.find(item => item._id === menu.menuId)?.name || 'N/A'}`}</p>
                                <p>{`${languageData.menuPrice || 'Menu Price'}: ${menus.find(item => item._id === menu.menuId)?.price || 'N/A'}`}</p>
                                <p>{`${languageData.quantity || 'Quantity'}: ${menu.quantityMenu}`}</p>
                                <h6>{languageData.articles || 'Articles'}:</h6>
                                {menus.find(item => item._id === menu.menuId)?.articles.map((menuArticle, menuArticleIndex) => (
                                  <div key={menuArticleIndex}>
                                    <p>{`${languageData.articleName || 'Article Name'}: ${menuArticle?.name || 'N/A'}`}</p>
                                    <p>{`${languageData.articlePrice || 'Article Price'}: ${menuArticle?.price || 'N/A'}`}</p>
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
                                <p>{`${languageData.articleName || 'Article Name'}: ${articles.find(item => item._id === article.articleId)?.name || 'N/A'}`}</p>
                                <p>{`${languageData.articlePrice || 'Article Price'}: ${articles.find(item => item._id === article.articleId)?.price || 'N/A'}`}</p>
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
                  <button onClick={() => PayOrder(order)}>{languageData.payOrder || 'Pay Order'}</button>
                  <button onClick={() => deleteOrder(order)}>{languageData.deleteOrder || 'Delete Order'}</button>
                  {order.OrderStatus === "en cours" && (
                    <>
                      <input
                        type="text"
                        placeholder={languageData.enterReferralCode || "Enter referral code"}
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                      />
                      <button onClick={() => handleApplyReferral(order)}>{languageData.applyReferralCode || 'Apply Referral Code'}</button>
                    </>
                  )}
                </div>
              )
            ))}
          </div>
          <hr /> 
          <div>
            <h4>{languageData.paidOrders || 'Paid Orders'}</h4>
            {orders.map((order, index) => (
              order.OrderStatus !== "en cours" && (
                <div key={index} className="order-paid">
                  <h5>{`${languageData.order || 'Order'} ${index + 1}`}</h5>
                  <p>{`${languageData.orderID || 'Order ID'}: ${order._id}`}</p>
                  <p>{`${languageData.orderAddress || 'Order Address'}: ${user.address}`}</p>
                  <p>{`${languageData.orderPhone || 'Order Phone'}: ${user.phoneNumber}`}</p>
<<<<<<< HEAD
                  <p>{`${languageData.orderPrice || 'Order Price'}: ${order.OrderPrice}`}</p>
=======
                  <p>{`${languageData.orderPrice || 'Order Price'}: ${order.OrderPrice.toFixed(2)}`}</p>
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
                  <p>{`${languageData.orderStatus || 'Order Status'}: ${order.OrderStatus}`}</p>
                  <h6>{languageData.subOrders || 'Sub Orders'}:</h6>
                  {order.Orders && order.Orders.length > 0 ? (
                    order.Orders.map((subOrder, subIndex) => (
                      <div key={subIndex}>
<<<<<<< HEAD
                        <p>{`${languageData.subOrderPrice || 'Sub Order Price'}: ${subOrder.OrderPrice}`}</p>
=======
                        <p>{`${languageData.subOrderPrice || 'Sub Order Price'}: ${subOrder.OrderPrice.toFixed(2)}`}</p>
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
                        <p>{`${languageData.subOrderStatus || 'Sub Order Status'}: ${subOrder.OrderStatus}`}</p>
                        {subOrder.Menus && subOrder.Menus.length > 0 && (
                          <>
                            <h6>{languageData.menus || 'Menus'}:</h6>
                            {subOrder.Menus.map((menu, menuIndex) => (
                              <div key={menuIndex}>
                                <p>{`${languageData.menuName || 'Menu Name'}: ${menus.find(item => item._id === menu.menuId)?.name || 'N/A'}`}</p>
                                <p>{`${languageData.menuPrice || 'Menu Price'}: ${menus.find(item => item._id === menu.menuId)?.price || 'N/A'}`}</p>
                                <p>{`${languageData.quantity || 'Quantity'}: ${menu.quantityMenu}`}</p>
                                <h6>{languageData.articles || 'Articles'}:</h6>
                                {menus.find(item => item._id === menu.menuId)?.articles.map((menuArticle, menuArticleIndex) => (
                                  <div key={menuArticleIndex}>
                                    <p>{`${languageData.articleName || 'Article Name'}: ${menuArticle?.name || 'N/A'}`}</p>
                                    <p>{`${languageData.articlePrice || 'Article Price'}: ${menuArticle?.price || 'N/A'}`}</p>
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
                                <p>{`${languageData.articleName || 'Article Name'}: ${articles.find(item => item._id === article.articleId)?.name || 'N/A'}`}</p>
                                <p>{`${languageData.articlePrice || 'Article Price'}: ${articles.find(item => item._id === article.articleId)?.price || 'N/A'}`}</p>
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
                  <button onClick={() => downloadPDF(order)}>{languageData.downloadPDF || 'Download as PDF'}</button>
                  {order.OrderStatus === "picked up" && (
                    <div className="circular-progressbar-container">
                      <CircularProgressbar
                        value={Math.max(0, (timers[order._id]?.timeLeft / timers[order._id]?.duration) * 100)}
                        text={`${Math.floor(Math.max(0, timers[order._id]?.timeLeft / 1000 / 60))}m ${Math.floor(Math.max(0, (timers[order._id]?.timeLeft / 1000) % 60))}s`}
                        styles={buildStyles({
                          textSize: '16px',
                          pathColor: `rgba(62, 152, 199, ${Math.max(0, timers[order._id]?.timeLeft / timers[order._id]?.duration)})`,
                          textColor: '#f88',
                          trailColor: '#d6d6d6',
                        })}
                      />
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        </>
      )}
      {showPaymentDialog && selectedOrder && (
        <ViewPaymentDialog order={selectedOrder} onClose={closePaymentDialog} />
      )}
    </div>
  );
}

export default Commandes;
