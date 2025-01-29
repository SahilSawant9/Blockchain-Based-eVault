import React, { useState } from 'react';
import axios from 'axios';
import './CSS/FileManagement.css'; // Import your CSS file

const FileManagement = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [dateOfJudgment, setDateOfJudgment] = useState('');
    const [caseNumber, setCaseNumber] = useState('');
    const [category, setCategory] = useState('');
    const [judgeName, setJudgeName] = useState('');
    const [linkedClients, setLinkedClients] = useState([]);
    const [errorMessage, setErrorMessage] = useState(''); // Ensure it's used when an error occurs

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Reset error message before attempting upload

        // Check if all fields are filled
        if (!file || !title || !dateOfJudgment || !caseNumber || !category || !judgeName) {
            setErrorMessage('Please fill in all required fields.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('dateOfJudgment', dateOfJudgment);
        formData.append('caseNumber', caseNumber);
        formData.append('category', category);
        formData.append('judgeName', judgeName);
        formData.append('linkedClients', JSON.stringify(linkedClients));

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data);
            alert('File uploaded successfully!');
        } catch (error) {
            console.error('Error uploading file:', error);
            setErrorMessage(`Error uploading file: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleLinkedClientsChange = (e) => {
        const input = e.target.value;
        const clientsArray = input.split(',').map(client => client.trim());
        setLinkedClients(clientsArray);
    };

    return (
        <div className="file-management">
            <div className="darkcover">
                <div className="head">CASE FILE UPLOAD</div>
                <div className="mukhya">Case Information</div> {/* Move Case Information heading here */}
                <form onSubmit={handleUpload}>
                    <div id="form1">
                        <div className="input1">
                            <label htmlFor="caseTitle">Case Title:</label>
                            <input 
                                type="text" 
                                id="caseTitle" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="input1">
                            <label htmlFor="caseType">Case Type:</label>
                            <input 
                                type="text" 
                                id="caseType" 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="input1">
                            <label htmlFor="judgeName">Judge Name:</label>
                            <input 
                                type="text" 
                                id="judgeName" 
                                value={judgeName}
                                onChange={(e) => setJudgeName(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="input1">
                            <label htmlFor="caseNumber">Case Number:</label>
                            <input 
                                type="text" 
                                id="caseNumber" 
                                value={caseNumber}
                                onChange={(e) => setCaseNumber(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="input1">
                            <label htmlFor="dateOfJudgment">Date of Judgment:</label>
                            <input 
                                type="date" 
                                id="dateOfJudgment" 
                                value={dateOfJudgment}
                                onChange={(e) => setDateOfJudgment(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="input1">
                            <label htmlFor="linkedClients">Linked Clients:</label>
                            <input 
                                type="text" 
                                id="linkedClients" 
                                onChange={handleLinkedClientsChange} 
                                placeholder="Comma-separated client IDs" 
                            />
                        </div>
                        <div className="input1">
                            <label htmlFor="fileUpload">Upload File:</label>
                            <input 
                                type="file" 
                                id="fileUpload" 
                                accept=".pdf,.doc,.docx,.txt" // Adjust accepted file types as needed
                                onChange={handleFileChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="button-container">
                        <button type="submit">Upload</button>
                    </div>
                </form>
                {errorMessage && <p style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</p>}
            </div>
        </div>
    );
};

export default FileManagement;
