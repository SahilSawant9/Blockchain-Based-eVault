import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './CSS/LawyerDashboard.css';

const LawyerDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/file-management');
    };

    const handleFindCaseClick = () => {
        navigate('/fetch-file');
    };

    const lawyerName = location.state?.name || 'Adv. Aniket Deshmukh';

    return (
        <div className="container">
            <img 
                src="/register-bg.jpg" 
                alt="register-law" 
                className="image" 
            />
            <div className="darkcover">
                <div className="box">
                    <div className="header">YOU ARE A REGISTERED LAWYER</div>
                    <div className="logo">
                        <img 
                            src="/Lawyer.png" 
                            alt="lawyer-logo" 
                            className="logo-image" 
                        />
                    </div>
                    <div className="dets">
                        {lawyerName}<br />
                        example.lawyer@example.com<br />
                        Registration No.: MAH/12345/2024
                    </div>
                    <div id="speciality">Civil Law & Property Disputes</div>
                    <div className="registerandfetchbuttons">
                        <button onClick={handleButtonClick} className="registercase">
                            Register a New Case
                        </button>
                        <button onClick={handleFindCaseClick} className="fetchcase">
                            Find a Case
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerDashboard;
