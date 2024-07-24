import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/dashboard.css";
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const API_URL = (window.location.host).split(":")[0];

async function fetchAllOrders() {
  try {
    const result = await axios.get(`http://${API_URL}:5000/order/all-orders`, {
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

function generateRandomFinancialData(orders) {
  return orders.map(order => ({
    ...order,
    financialInfo: {
      revenue: Math.floor(Math.random() * 100) + 1,
      profit: Math.floor(Math.random() * 50) + 1,
      expenses: Math.floor(Math.random() * 30) + 1,
    },
  }));
}

function FinancialDashboard() {
  const [orders, setOrders] = useState([]);
  const user = useSelector((state) => state.user?.user);
  const location = useLocation();
  const [languageData, setLanguageData] = useState({});

  useEffect(() => {
    async function fetchOrders() {
      try {
        const allOrders = await fetchAllOrders();
        const ordersWithFinancialData = generateRandomFinancialData(allOrders);
        setOrders(ordersWithFinancialData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }

    fetchOrders();
  }, [user]);

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

  const totalRevenue = orders.reduce((acc, order) => acc + order.financialInfo.revenue, 0);
  const totalProfit = orders.reduce((acc, order) => acc + order.financialInfo.profit, 0);
  const totalExpenses = orders.reduce((acc, order) => acc + order.financialInfo.expenses, 0);

  const data = {
    labels: orders.map((order, index) => `Order ${index + 1}`),
    datasets: [
      {
        label: languageData.revenue || 'Revenue',
        data: orders.map(order => order.financialInfo.revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: languageData.profit || 'Profit',
        data: orders.map(order => order.financialInfo.profit),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: languageData.expenses || 'Expenses',
        data: orders.map(order => order.financialInfo.expenses),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dashboard">
      <h3>{languageData.financialDashboard || 'Financial Dashboard'}</h3>
      <div className="dashboard-content">
        <div className="dashboard-summary">
          <h4>{languageData.totalRevenue || 'Total Revenue'}: {totalRevenue} €</h4>
          <h4>{languageData.totalProfit || 'Total Profit'}: {totalProfit} €</h4>
          <h4>{languageData.totalExpenses || 'Total Expenses'}: {totalExpenses} €</h4>
        </div>
        <div className="dashboard-chart">
          <Bar data={data} />
        </div>
      </div>
    </div>
  );
}

export default FinancialDashboard;
