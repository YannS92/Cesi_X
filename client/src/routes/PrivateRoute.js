import {Navigate, Outlet} from "react-router-dom";

const PrivateRoute = () => {

    const isAuth = localStorage.getItem("token");

    return isAuth
        ? <Outlet/>
        : <Navigate to="/feed"/>;

};

export default PrivateRoute;

function RequireRole({children, allowedRoles, userRole}) {
    return allowedRoles.includes(userRole)
        ? children
        : <Navigate to="/login" replace/>;
}

export {RequireRole};
