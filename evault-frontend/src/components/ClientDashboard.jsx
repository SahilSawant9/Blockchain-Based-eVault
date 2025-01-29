import React from 'react';
import { useLocation } from 'react-router-dom';

const ClientDashboard = () => {
    const location = useLocation();
    const clientName = location.state?.name || 'Client';

    return (
        <div className="client-container">
            <h1>Hello, {clientName}!</h1>
        </div>
    );
};

export default ClientDashboard;
