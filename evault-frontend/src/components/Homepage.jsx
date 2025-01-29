import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Homepage.css';

const Homepage = () => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/auth'); // Navigate to the Auth Page
    };

    return (
        <div className="container">
            <img 
                src="/law-bg.jpg" 
                alt="homepage-law" 
                className="image" 
            />
            <div className="darkcover">
                <div className="title">BLOCKCHAIN BASED e-VAULT</div>
                <button onClick={handleButtonClick} className="button">
                    GET STARTED
                </button>
            </div>
        </div>
    );
};

export default Homepage;
