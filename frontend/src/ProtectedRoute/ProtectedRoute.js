import React, { useContext } from 'react'
import { UserContext } from '../ContextApi/userContex';
import { Navigate, Outlet, Route } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useContext(UserContext);

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute