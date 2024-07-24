import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { userCurrent } from "./redux/slice/userSlice";
import "./App.css";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PrivateRoute from "./routes/PrivateRoute";
import Commandes from "./pages/Commandes";
import RestaurantOrder from "./pages/RestaurantOrder";
import QrCodeHandler from "./pages/QrCodeHandler";
import DepComercial from "./pages/DepComercial";
import Favoris from "./pages/Favoris";
import Navbar from "./components/Navbar";
import Test from "./pages/Test";
import VerifPay from './pages/VerifPay';
import PaymentHistory from './pages/PaymentHistory';
import Error from "./pages/Error";
import Feed from "./pages/Feed";
import RequireRole from "./routes/PrivateRoute"; 
import Dashboard from "./pages/Dashboard";
import RestaurantDetail from "./pages/RestaurantDetail"; 
import UserManagement from './pages/UserManagement';
import UserDetails from './pages/UserDetails';
import AdminOrders from "./pages/AdminOrders";
import DeliveryCommands from "./pages/DeliveryCommands";
<<<<<<< HEAD
=======
import FinancialDashboard from './pages/FinancialDashboard'; // Adjust the path as needed
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

function App() {
  const dispatch = useDispatch();
  const isAuth = localStorage.getItem("token");
  const [ping, setPing] = useState(false);
  const userRole = useSelector(state => state.user.user?.role);
  const userLang = useSelector(state => state.user.user?.lang);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const stripePromise = loadStripe('pk_test_51PMUzFKJ5LRFuT3XFS2dKbfHUQm734UzoqoQXunU66rfSFilgwLXyqIBrbuecc83rlMTKQxEzijrX7iQAqPGIXXz00av4XhuzD');
  
  const langUrl = userLang === undefined ? "fr" : userLang;
  const lang = searchParams.get('lang') || langUrl;

  useEffect(() => {
    if (isAuth) {
      dispatch(userCurrent());
    }
    if (isAuth && location.pathname === '/') {
      navigate(`/profile?lang=${lang}`, { replace: true });
    }
  }, [dispatch, isAuth, location.pathname, lang, navigate]);

  return (
    <div className="app-container">
      {/* Conditionally render Navbar based on the current path */}
      {location.pathname !== '/' && <Navbar />}

      <div className="content">
        <Elements stripe={stripePromise}>
          <TransitionGroup>
            <CSSTransition key={location.key} classNames="fade" timeout={1000}>
              <Routes location={location}>
                <Route path="/" element={isAuth ? <Navigate to={`/profile?lang=${lang}`} replace /> : <Login ping={ping} setPing={setPing} />} />
                <Route path="/test" element={<Test />} />
                <Route path="/verif-pay" element={<VerifPay />} />
                <Route path="/payment-history" element={<PaymentHistory />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} /> {/* Add this line for RestaurantDetail */}
                <Route path="/admin-orders" element={<AdminOrders />} /> {/* Add this line for AdminOrders */}
                {/* Applying RequireRole for protected routes */}
                <Route element={<PrivateRoute />}>
                  <Route element={<RequireRole allowedRoles={['user']} userRole={userRole} />}>
                    <Route path="/profile" element={<Profile ping={ping} setPing={setPing} />} />
                  </Route>
                </Route>

                <Route path="/commandes" element={<Commandes />} />
                <Route path="/qr-code-handler/:subOrderId" element={<QrCodeHandler />} />
                <Route path="/restaurantOrder" element={<RestaurantOrder />} />
                <Route path="/depcomercial" element={<DepComercial />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/favoris" element={<Favoris />} />
                <Route path="/error" element={<Error />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/usermanagement" element={<UserManagement />} />
                <Route path="/user/:id" element={<UserDetails />} />
                <Route path="/delivery-commands" element={<DeliveryCommands />} />
<<<<<<< HEAD
=======
                <Route path="/financial-dashboard" element={<FinancialDashboard />} /> 
>>>>>>> 8e72f17f710ce32065efe7ffea78856994bf13b8
              </Routes>
            </CSSTransition>
          </TransitionGroup>
        </Elements>
      </div>
    </div>
  );
}

export default App;
