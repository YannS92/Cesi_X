import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import moment from 'moment';
import '../styles/paymenthistory.css';
import jsPDF from 'jspdf';
const API_URL = (window.location.host).split(":")[0];
const PaymentHistory = () => {
    const user = useSelector((state) => state.user?.user);
    const [payments, setPayments] = useState([]);
    const [error, setError] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [articles, setArticles] = useState([]);
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get(`http://${API_URL}:5000/payments/${user._id}`);
                setPayments(response.data);
            } catch (error) {
                console.error('Error fetching payment history:', error);
                setError('Error fetching payment history');
            }
        };

        fetchPayments();
    }, [user]);

    const fetchOrderDetails = async (orderId) => {
        try {
            const result = await axios.get(`http://${API_URL}:5000/order/${orderId}`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });
            return result.data;
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);
            setError(`Error fetching order ${orderId}`);
        }
    }

    const fetchArticle = async (idarticle) => {
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

    const fetchRestaurant = async (idRestaurant) => {
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

    const fetchMenu = async (idMenu) => {
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

    const handleShowDetails = async (payment) => {
        setSelectedPayment(payment);
        const order = await fetchOrderDetails(payment.orderId);

        if (order) {
            const articleIds = order.Orders.flatMap(subOrder =>
                subOrder.Articles.map(article => article.articleId)
            );

            const menuIds = order.Orders.flatMap(subOrder =>
                subOrder.Menus.map(menu => menu.menuId)
            );

            const orderRestaurantInfo = await Promise.all(
                order.Orders.map(async subOrder => {
                    const restaurant = await fetchRestaurant(subOrder.restaurantId);
                    return { id: subOrder.restaurantId, name: restaurant.name };
                })
            );

            const orderArticleInfo = await Promise.all(
                articleIds.map(async (articleId) => {
                    return await fetchArticle(articleId);
                })
            );

            const orderMenuInfo = await Promise.all(
                menuIds.map(async (menuId) => {
                    return await fetchMenu(menuId);
                })
            );

            setRestaurants(orderRestaurantInfo);
            setArticles(orderArticleInfo);
            setMenus(orderMenuInfo);
            setSelectedOrder(order);
        }
    }

    const handleCloseDetails = () => {
        setSelectedPayment(null);
        setSelectedOrder(null);
    };

    const downloadPDF = (order) => {
        const doc = new jsPDF();
        let yOffset = 10;
        doc.text(`Order ${1}`, 10, yOffset);
        yOffset += 10;
        doc.text(`Order Address: ${user.address}`, 10, yOffset);
        yOffset += 10;
        doc.text(`Order Phone: ${user.phoneNumber}`, 10, yOffset);
        yOffset += 10;
        doc.text(`Order Price: ${order.OrderPrice}`, 10, yOffset);
        yOffset += 10;
        doc.text(`Order Status: ${order.OrderStatus}`, 10, yOffset);
        yOffset += 10;
    
        order.Orders.forEach((subOrder, subIndex) => {
          doc.text(`  Sub Order ${subIndex + 1}`, 10, yOffset);
          yOffset += 10;
          const restaurantInfo = restaurants.find(r => r.id === subOrder.restaurantId);
          doc.text(`  Restaurant Name: ${restaurantInfo ? restaurantInfo.name : 'N/A'}`, 10, yOffset);
          yOffset += 10;
          doc.text(`  Sub Order Price: ${subOrder.OrderPrice}`, 10, yOffset);
          yOffset += 10;
          doc.text(`  Sub Order Status: ${subOrder.OrderStatus}`, 10, yOffset);
          yOffset += 10;
    
          subOrder.Articles.forEach(article => {
            const articleInfo = articles.find(item => item._id === article.articleId);
            doc.text(`    Article Name: ${articleInfo ? articleInfo.name : 'N/A'}`, 10, yOffset);
            yOffset += 10;
            doc.text(`    Article Price: ${articleInfo ? articleInfo.price : 'N/A'}`, 10, yOffset);
            yOffset += 10;
            doc.text(`    Quantity: ${article.quantity}`, 10, yOffset);
            yOffset += 10;
          });
        });
    
        yOffset += 10;
    
        doc.save('orders.pdf');
    };

    return (
        <div>
            <h1>Historique des Paiements</h1>
            {error && <p>{error}</p>}
            {payments.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Montant</th>
                            <th>Devise</th>
                            <th>Statut</th>
                            <th>OrderID</th>
                            <th>Détails</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(payment => (
                            <tr key={payment._id}>
                                <td>{moment(payment.createdAt).format('YYYY-MM-DD | HH:mm')}</td>
                                <td>{payment.amount / 100}</td>
                                <td>{payment.currency.toUpperCase()}</td>
                                <td>{payment.status}</td>
                                <td>{payment.orderId}</td>
                                <td>
                                    <button onClick={() => handleShowDetails(payment)}>Voir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Aucun paiement trouvé</p>
            )}

            {selectedPayment && selectedOrder && (
                <div id="detailsModal" className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseDetails}>&times;</span>
                        
                        <h2>Détails du Paiement</h2>
                        <div className="order-paid">
                            <p>Order ID: {selectedOrder._id}</p>
                            <p>Address: {user.address}</p>
                            <p>Phone Number: {user.phoneNumber}</p>
                            <p>Total Price: {selectedOrder.OrderPrice}€</p>
                            <p>Status: {selectedOrder.OrderStatus}</p>
                            <h3>Sub Orders:</h3>
                            {selectedOrder.Orders && selectedOrder.Orders.length > 0 ? (
                                selectedOrder.Orders.map((subOrder, subIndex) => (
                                    <div key={subIndex}>
                                        <h4>Sub Order : {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'N/A'}</h4>
                                        <p>Restaurant Name: {restaurants.find(r => r.id === subOrder.restaurantId)?.name || 'N/A'}</p>
                                        <p>Sub Order Price: {subOrder.OrderPrice}€</p>
                                        <p>Sub Order Status: {subOrder.OrderStatus}</p>
                                        {subOrder.Menus && subOrder.Menus.length > 0 && (
                                            <>
                                                <h4>Menus:</h4>
                                                {subOrder.Menus.map((menu, menuIndex) => (
                                                    <div key={menuIndex}>
                                                        <p>Name: {menus.find(item => item._id === menu.menuId)?.name || 'N/A'} x{menu.quantityMenu}    </p>
                                                        <p>Menu Price: {menus.find(item => item._id === menu.menuId)?.price || 'N/A'}€</p>
                                                        <h5>Menu Articles:</h5>
                                                        {menus.find(item => item._id === menu.menuId)?.articles.map((menuArticle, menuArticleIndex) => (
                                                            <div key={menuArticleIndex}>
                                                                <p>Name: {menuArticle?.name || 'N/A'}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                        {subOrder.Articles && subOrder.Articles.length > 0 && (
                                            <>
                                                <h4>Articles:</h4>
                                                {subOrder.Articles.map((article, articleIndex) => (
                                                    <div key={articleIndex}>
                                                        <p>Name: {articles.find(item => item._id === article.articleId)?.name || 'N/A'} x{article.quantity}</p>
                                                        <p>Price: {articles.find(item => item._id === article.articleId)?.price || 'N/A'}€</p>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No sub-orders found.</p>
                            )}
                            <button onClick={() => downloadPDF(selectedOrder)}>Download as PDF</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentHistory;
