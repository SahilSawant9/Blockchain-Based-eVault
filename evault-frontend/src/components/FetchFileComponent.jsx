import React, { useState } from 'react';
import axios from 'axios';
import './CSS/FetchFileComponent.css'; // Import the CSS file

const FetchFileComponent = () => {
    const [title, setTitle] = useState('');
    const [fetchedMetadata, setFetchedMetadata] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(null);

    const fetchCaseMetadata = async () => {
        try {
            // Call the API to search by title
            const response = await axios.get(`http://localhost:5000/metadata/${title}`);
            
            if (!response.data.metadata) {
                setErrorMessage('No case found for the given title');
                setFetchedMetadata(null);
                return;
            }

            const caseData = response.data.metadata; // Assuming only one result per title

            // Store metadata in state (without IPFS hash)
            setFetchedMetadata(caseData);
            setErrorMessage('');
        } catch (error) {
            console.error('Error fetching case metadata:', error);
            setErrorMessage(`Error fetching metadata: ${error.response?.data?.message || error.message}`);
            setFetchedMetadata(null); // Clear previously fetched metadata on error
        }
    };

    const verifyPassword = () => {
        // Check if the password (IPFS hash) entered matches the case's IPFS hash
        if (fetchedMetadata && password === fetchedMetadata.ipfsHash) {
            setIsPasswordCorrect(true);
        } else {
            setIsPasswordCorrect(false);
        }
    };

    return (
        <div className="fetch-container">
            <div className="fetch-input-button">
                <input
                    type="text"
                    placeholder="Enter case title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <button onClick={fetchCaseMetadata}>Fetch Case Metadata</button>
            </div>

            {errorMessage && <p>{errorMessage}</p>}

            {fetchedMetadata && (
                <div className="metadata-container">
                    <h3>Case Metadata</h3>
                    <strong>Title:</strong> {fetchedMetadata.title} <br />
                    <strong>Date of Judgment:</strong> {fetchedMetadata.dateOfJudgment} <br />
                    <strong>Case Number:</strong> {fetchedMetadata.caseNumber} <br />
                    <strong>Category:</strong> {fetchedMetadata.category} <br />
                    <strong>Judge Name:</strong> {fetchedMetadata.judgeName} <br />
                    <strong>Linked Clients:</strong> {fetchedMetadata.linkedClients.join(', ')} <br />
                    <strong>Uploader:</strong> {fetchedMetadata.uploader} <br />
                    <strong>Timestamp:</strong> {new Date(fetchedMetadata.timestamp).toLocaleString()} <br />

                    {/* Password field to open the uploaded file */}
                    <div className="password-section">
                        <input
                            type="text"
                            placeholder="Enter IPFS Hash to open file"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button onClick={verifyPassword}>Verify</button>
                    </div>

                    {isPasswordCorrect === true && (
                        <div>
                            <h4>Password Correct! You can view the file now.</h4>
                            {/* Display the file or the IPFS hash to access it */}
                            <a
                                href={`https://ipfs.io/ipfs/${fetchedMetadata.ipfsHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open File
                            </a>
                        </div>
                    )}
                    {isPasswordCorrect === false && (
                        <p>Password is incorrect. Please try again.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FetchFileComponent;
