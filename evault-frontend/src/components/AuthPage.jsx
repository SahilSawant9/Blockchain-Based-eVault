import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/AuthPage.css';
import axios from 'axios';

const AuthPage = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [scriptRun, setScriptRun] = useState(false); // Tracks script execution status for lawyers
    const [isLoading, setIsLoading] = useState(false); // Tracks API request status
    const [error, setError] = useState(''); // For displaying any errors related to user input

    const validateInput = () => {
        if (!userType) {
            alert('Please select a user type.');
            return false;
        }

        if (!name.trim()) {
            alert('Please enter your name.');
            return false;
        }

        if (userType === 'lawyer' && scriptRun && !address.trim()) {
            alert('Please enter your Ethereum address.');
            return false;
        }

        return true;
    };

    const handleContinue = async () => {
        if (!validateInput()) return;

        try {
            setIsLoading(true); // Start loading indicator

            if (userType === 'lawyer' && !scriptRun) {
                // Execute script for lawyer
                const response = await axios.post('http://localhost:5000/executeScript', { lawyerSelected: true });

                if (response.data.message === 'Script executed successfully') {
                    setScriptRun(true);
                    alert('Script executed successfully. Now you can enter the Ethereum address.');
                } else {
                    throw new Error(response.data.message || 'Failed to execute the script.');
                }

                setIsLoading(false); // Stop loading indicator
                return;
            }

            // Add user to the system
            const user = {
                name,
                userType,
                address: userType === 'lawyer' ? address : null,
            };

            const response = await axios.post('http://localhost:5000/addUser', user);

            if (response.data.success) {
                // Check for address already registered message
                if (response.data.message && response.data.message.includes('Address already registered')) {
                    setError('This Ethereum address is already registered.');
                    return;
                }

                // If the user is added successfully, navigate to dashboard
                navigate(`/${userType}-dashboard`, { state: { name } });
            } else {
                throw new Error(response.data.message || 'Failed to add user.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'An error occurred. Please try again later.');
        } finally {
            setIsLoading(false); // Stop loading indicator
        }
    };

    return (
        <div className="auth-container">
            <h1>Login/Signup</h1>

            <div className="form-group">
                <label htmlFor="name">Enter Your Name</label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                />
            </div>

            <div className="form-group">
                <label>Select User Type</label>
                <div>
                    <input
                        type="radio"
                        id="lawyer"
                        name="userType"
                        value="lawyer"
                        onChange={(e) => setUserType(e.target.value)}
                    />
                    <label htmlFor="lawyer">Lawyer</label>
                </div>
                <div>
                    <input
                        type="radio"
                        id="client"
                        name="userType"
                        value="client"
                        onChange={(e) => setUserType(e.target.value)}
                    />
                    <label htmlFor="client">Client</label>
                </div>
            </div>

            {userType === 'lawyer' && scriptRun && (
                <div className="form-group">
                    <label htmlFor="address">Enter Ethereum Address</label>
                    <input
                        type="password" // Changed type to password for obscuring input
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your Ethereum address"
                    />
                </div>
            )}

            {/* Display error message if there's an address conflict */}
            {error && <div className="error-message">{error}</div>}

            <button
                onClick={handleContinue}
                className="button"
                disabled={isLoading || (userType === 'lawyer' && scriptRun && !address.trim())}
            >
                {isLoading ? 'Processing...' : 'Continue'}
            </button>
        </div>
    );
};

export default AuthPage;
