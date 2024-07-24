import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode.react";
import "../styles/commandes.css";
import ViewPaymentDialog from "../components/ViewPaymentDialog";
import { fetchAllDeliveryPersons } from "../redux/slice/deliveryPersonSlice";
const API_URL = (window.location.host).split(":")[0];

async function fetchOrdersByUserRole(user) {
  let orderDetails = [];

  if (user && user.orders) {
    if (user.role === "restaurantOwner") {
      try {
        const result = await axios.get(`http://${API_URL}:5000/restaurant/owner/${user._id}`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        const restaurants = result.data;

        for (const restaurant of restaurants) {
          for (const subOrderId of restaurant.subOrders) {
            const orderResult = await axios.get(`http://${API_URL}:5000/order/suborder/${subOrderId}`, {
              headers: {
                Authorization: localStorage.getItem("token"),
              },
            });
            const order = orderResult.data;
            if (order.Orders.some(subOrder => subOrder.OrderStatus === "en cours" || subOrder.OrderStatus === "accepted")) {
              orderDetails.push(order);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching orders for restaurants owned by ${user._id}:`, error);
      }
    } else {
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
  }

  return orderDetails;
}

async function FetchRestaurant(idRestaurant) {
  try {
    const result = await axios.get(`http://${API_URL}:5000/restaurant/${idRestaurant}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    return result.data;
  } catch (error) {
    console.error(`Error fetching restaurant ${idRestaurant}:`, error);
  }
}

function RestaurantOrder() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const user = useSelector((state) => state.user?.user);
  const deliveryPersons = useSelector((state) => state.deliveryPerson.deliveryPersons);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeliveryPersonDialog, setShowDeliveryPersonDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const [languageData, setLanguageData] = useState({});

  useEffect(() => {
    async function fetchOrders() {
      try {
        const orders = await fetchOrdersByUserRole(user);
        setOrders(orders);

        const orderRestaurantInfo = await Promise.all(
          orders.flatMap(order =>
            order.Orders.map(subOrder => subOrder.restaurantId)
          ).map(async restaurantId => {
            const restaurant = await FetchRestaurant(restaurantId);
            return { id: restaurantId, name: restaurant.name };
          })
        );

        setRestaurants(orderRestaurantInfo);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }

    fetchOrders();
    dispatch(fetchAllDeliveryPersons());
  }, [user?.orders, dispatch]);

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

  const acceptOrder = async (subOrder) => {
    try {
      const response = await axios.put(`http://${API_URL}:5000/order/accept-suborder/${subOrder.subOrderId._id}`, {}, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.data.success) {
        alert('Sub-order accepted successfully!');
        window.location.reload(); // Refresh the page to reflect changes
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error accepting sub-order:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error accepting sub-order: ${error.response.data.message}`);
      } else {
        alert('An error occurred while accepting the sub-order.');
      }
    }
  };

  const validateDelivery = async (subOrderId) => {
    try {
      const response = await axios.put(`http://${API_URL}:5000/order/validate-delivery/${subOrderId}`, {}, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.data.success) {
        alert('Sub-order validated for delivery successfully!');
        window.location.reload(); // Refresh the page to reflect changes
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error validating sub-order for delivery:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error validating sub-order for delivery: ${error.response.data.message}`);
      } else {
        alert('An error occurred while validating the sub-order for delivery.');
      }
    }
  };

  const handleAssignDeliveryPerson = async () => {
    if (!selectedDeliveryPerson) {
      alert('Please select a delivery person.');
      return;
    }

    try {
      console.log("Selected Order ID:", selectedOrder._id);
      console.log("Selected Delivery Person ID:", selectedDeliveryPerson);
      const response = await axios.put(`http://${API_URL}:5000/order/assign-delivery-person/${selectedOrder._id}`, {
        DeliveryPersonId: selectedDeliveryPerson
      }, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      if (response.data.message) {
        alert('Delivery person assigned successfully!');
        window.location.reload(); // Refresh the page to reflect changes
      } else {
        alert(response.data.error);
      }
    } catch (error) {
      console.error('Error assigning delivery person:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error assigning delivery person: ${error.response.data.error}`);
      } else {
        alert('An error occurred while assigning the delivery person.');
      }
    }
  };

  const PayOrder = (order) => {
    setSelectedOrder(order);
    setShowPaymentDialog(true);
  };

  const closePaymentDialog = () => {
    setShowPaymentDialog(false);
  };

  const openDeliveryPersonDialog = (order) => {
    setSelectedOrder(order);
    setShowDeliveryPersonDialog(true);
  };

  const handleDeliveryPersonSelection = (personId) => {
    setSelectedDeliveryPerson(personId);
  };

  return (
    <div className="wrapper">
      <h3>{languageData.Commandes || 'Orders'}</h3>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <>
          <div>
            <hr></hr>
            <h4>Orders in Progress</h4>
            {orders.filter(order => order.OrderStatus !== "en cours").map((order, index) => (
              <div key={index} className="ticket-wrap">
                <div className="ticket">
                  <div className="ticket__header">
                    <div className="ticket__co">
                      <svg className="ticket__co-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
                        <circle fill="#506072" cx="32" cy="32" r="32" />
                      </svg>
                      <span className="ticket__co-name">{restaurants.find(r => r.id === order.Orders[0].restaurantId)?.name || 'Unknown'}</span>
                      <span className="u-upper ticket__co-subname">Restaurant Order</span>
                    </div>
                  </div>
                  <div className="ticket__body">
                    <p className="ticket__route">Order ID: {order._id}</p>
                    <p className="ticket__description">Order Address: {order.orderaddress}</p>
                    <div className="ticket__timing">
                      <p>
                        <span className="u-upper ticket__small-label">Phone</span>
                        <span className="ticket__detail">{order.orderPhone}</span>
                      </p>
                      <p>
                        <span className="u-upper ticket__small-label">Price</span>
                        <span className="ticket__detail">{order.OrderPrice} €</span>
                      </p>
                      <p>
                        <span className="u-upper ticket__small-label">Status</span>
                        <span className="ticket__detail">{order.OrderStatus}</span>
                      </p>
                    </div>
                    <h6 className="ticket__fine-print">Sub Orders:</h6>
                    {order.Orders && order.Orders.length > 0 ? (
                      order.Orders.filter(subOrder => subOrder.OrderStatus === "en cours").map((subOrder, subIndex) => (
                        <div key={subIndex}>
                          <h6>Sub Order: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'Unknown'}</h6>
                          <p>Restaurant Name: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'Unknown'}</p>
                          <p>Sub Order Price: {subOrder.OrderPrice}</p>
                          <p>Sub Order Status: {subOrder.subOrderId.OrderStatus}</p>
                          {subOrder.Menus && subOrder.Menus.length > 0 && (
                            <>
                              <h6>Menus:</h6>
                              {subOrder.Menus.map((menu, menuIndex) => (
                                <div key={menuIndex}>
                                  <p>Menu Name: {menu.name}</p>
                                  <p>Menu Price: {menu.price}</p>
                                  <p>Quantity: {menu.quantityMenu}</p>
                                </div>
                              ))}
                            </>
                          )}
                          {subOrder.Articles && subOrder.Articles.length > 0 && (
                            <>
                              <h6>Articles:</h6>
                              {subOrder.Articles.map((article, articleIndex) => (
                                <div key={articleIndex}>
                                  <p>Article Name: {article.name}</p>
                                  <p>Article Price: {article.price}</p>
                                  <p>Quantity: {article.quantity}</p>
                                </div>
                              ))}
                            </>
                          )}
                          <button onClick={() => acceptOrder(subOrder)}>Accepter la commande</button>
                        </div>
                      ))
                    ) : (
                      <p>No sub-orders found.</p>
                    )}
                    {order.DeliveryPersonId ? (
                      <p>Delivery Person Assigned</p>
                    ) : (
                      <button onClick={() => openDeliveryPersonDialog(order)}>Assign Delivery Person</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <hr></hr>
            <h4>Accepted Orders</h4>
            {orders.filter(order => order.Orders.some(subOrder => subOrder.OrderStatus === "accepted")).map((order, index) => (
              <div key={index} className="ticket-wrap">
                <div className="ticket">
                  <div className="ticket__header">
                    <div className="ticket__co">
                      <svg className="ticket__co-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
                        <circle fill="#506072" cx="32" cy="32" r="32" />
                      </svg>
                      <span className="ticket__co-name">{restaurants.find(r => r.id === order.Orders[0].restaurantId)?.name || 'Unknown'}</span>
                      <span className="u-upper ticket__co-subname">Restaurant Order</span>
                    </div>
                  </div>
                  <div className="ticket__body">
                    <p className="ticket__route">Order ID: {order._id}</p>
                    <p className="ticket__description">Order Address: {order.orderaddress}</p>
                    <div className="ticket__timing">
                      <p>
                        <span className="u-upper ticket__small-label">Phone</span>
                        <span className="ticket__detail">{order.orderPhone}</span>
                      </p>
                      <p>
                        <span className="u-upper ticket__small-label">Price</span>
                        <span className="ticket__detail">{order.OrderPrice} €</span>
                      </p>
                      <p>
                        <span className="u-upper ticket__small-label">Status</span>
                        <span className="ticket__detail">{order.OrderStatus}</span>
                      </p>
                    </div>
                    <h6 className="ticket__fine-print">Sub Orders:</h6>
                    {order.Orders && order.Orders.length > 0 ? (
                      order.Orders.filter(subOrder => subOrder.OrderStatus === "accepted").map((subOrder, subIndex) => (
                        <div key={subIndex}>
                          <h6>Sub Order: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'Unknown'}</h6>
                          <p>Restaurant Name: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'Unknown'}</p>
                          <p>Sub Order Price: {subOrder.OrderPrice}</p>
                          <p>Sub Order Status: {subOrder.subOrderId.OrderStatus}</p>
                          {subOrder.Menus && subOrder.Menus.length > 0 && (
                            <>
                              <h6>Menus:</h6>
                              {subOrder.Menus.map((menu, menuIndex) => (
                                <div key={menuIndex}>
                                  <p>Menu Name: {menu.name}</p>
                                  <p>Menu Price: {menu.price}</p>
                                  <p>Quantity: {menu.quantityMenu}</p>
                                </div>
                              ))}
                            </>
                          )}
                          {subOrder.Articles && subOrder.Articles.length > 0 && (
                            <>
                              <h6>Articles:</h6>
                              {subOrder.Articles.map((article, articleIndex) => (
                                <div key={articleIndex}>
                                  <p>Article Name: {article.name}</p>
                                  <p>Article Price: {article.price}</p>
                                  <p>Quantity: {article.quantity}</p>
                                </div>
                              ))}
                            </>
                          )}
                          <QRCode value={`${window.location.origin}/qr-code-handler/${subOrder.subOrderId._id}`} />
                        </div>
                      ))
                    ) : (
                      <p>No accepted sub-orders found.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {showPaymentDialog && selectedOrder && (
        <ViewPaymentDialog order={selectedOrder} onClose={closePaymentDialog} />
      )}
      {showDeliveryPersonDialog && (
        <div className="delivery-person-dialog">
          <h4>Select a Delivery Person</h4>
          {deliveryPersons.length > 0 ? (
            deliveryPersons.map(person => (
              <div key={person._id}>
                <p>Name: {person.userId.name}</p>
                <p>Email: {person.userId.email}</p>
                <p>Vehicle: {person.vehicleDetails}</p>
                <button onClick={() => handleDeliveryPersonSelection(person._id)}>Select</button>
              </div>
            ))
          ) : (
            <p>No delivery persons available.</p>
          )}
          <button onClick={handleAssignDeliveryPerson}>Assign</button>
          <button onClick={() => setShowDeliveryPersonDialog(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default RestaurantOrder;
