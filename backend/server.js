const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { uploadToPinata, storeHashInContract } = require('../scripts/pinataIntegration');
const { ethers } = require("hardhat");
const { exec } = require('child_process');
require("dotenv").config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Enable CORS
app.use(cors());

// In-memory storage
let fileMetadata = {};
let scriptExecuted = false;  // For Lawyers
let clientScriptExecuted = false;  // For Clients
let users = [];  // Store registered users

// Middleware for JSON parsing
app.use(express.json());

/** ================= Lawyer Registration Flow ================= */

// Execute `addCourtOfficial.js` script
app.post('/executeScript', async (req, res) => {
    const { lawyerSelected } = req.body;

    if (!lawyerSelected) {
        return res.status(400).json({ message: 'Lawyer must be selected before proceeding.' });
    }

    try {
        const scriptPath = path.resolve(__dirname, '../scripts/addCourtOfficial.js');
        
        exec(`node ${scriptPath}`, (error, stdout, stderr) => {
            if (error || stderr) {
                console.error(`Error executing script: ${error?.message || stderr}`);
                return res.status(500).json({ message: 'Error executing the script.' });
            }

            console.log(`stdout: ${stdout}`);
            scriptExecuted = true;
            res.status(200).json({ message: 'Script executed successfully', output: stdout });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error executing the script.', error: error.message });
    }
});

// Enter Ethereum address for lawyer
app.post('/enterAddress', async (req, res) => {
    const { address } = req.body;

    if (!scriptExecuted) {
        return res.status(400).json({ message: 'Execute script first before entering Ethereum address.' });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
        return res.status(400).json({ message: 'Invalid Ethereum address format.' });
    }

    res.status(200).json({ message: 'Ethereum address received successfully.', address });
});

/** ================= Client Registration Flow ================= */

// Execute `addClient.js` script
app.post('/executeClientScript', async (req, res) => {
    const { clientSelected } = req.body;

    if (!clientSelected) {
        return res.status(400).json({ message: 'Client must be selected before proceeding.' });
    }

    try {
        const scriptPath = path.resolve(__dirname, '../scripts/addClient.js');
        
        exec(`node ${scriptPath}`, (error, stdout, stderr) => {
            if (error || stderr) {
                console.error(`Error executing script: ${error?.message || stderr}`);
                return res.status(500).json({ message: 'Error executing the script.' });
            }

            console.log(`stdout: ${stdout}`);
            clientScriptExecuted = true;
            res.status(200).json({ message: 'Script executed successfully', output: stdout });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error executing the script.', error: error.message });
    }
});

// Enter Ethereum address for client
app.post('/enterClientAddress', async (req, res) => {
    const { address } = req.body;

    if (!clientScriptExecuted) {
        return res.status(400).json({ message: 'Execute script first before entering Ethereum address.' });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
        return res.status(400).json({ message: 'Invalid Ethereum address format.' });
    }

    res.status(200).json({ message: 'Ethereum address received successfully.', address });
});

/** ================= File Upload & Retrieval ================= */

// Handle file uploads
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, dateOfJudgment, caseNumber, category, judgeName, linkedClients } = req.body;
    try {
        const fileStream = fs.createReadStream(req.file.path);
        const ipfsHash = await uploadToPinata(fileStream, req.file.originalname);

        const clientsArray = Array.isArray(linkedClients) ? linkedClients : JSON.parse(linkedClients || "[]");
        await storeHashInContract(ipfsHash, title, dateOfJudgment, caseNumber, category, judgeName, clientsArray);

        fileMetadata[title] = {
            title, dateOfJudgment, caseNumber, category, judgeName, linkedClients: clientsArray,
            uploader: req.file.originalname, timestamp: new Date(), ipfsHash
        };

        res.json({ message: 'File uploaded successfully', file: req.file, ipfsHash, metadata: fileMetadata[title] });
    } catch (error) {
        res.status(500).json({ message: 'Error processing the upload', error: error.message });
    } finally {
        fs.unlink(req.file.path, err => err && console.error(`Error deleting file: ${err}`));
    }
});

// Retrieve all case files
app.get('/files', async (req, res) => {
    const [deployer] = await ethers.getSigners();
    const NavinEvault = await ethers.getContractFactory("NavinEvault");
    const contract = await NavinEvault.attach(process.env.NAVINEVAULT_CONTRACT_ADDRESS);

    try {
        const totalFiles = await contract.totalCaseFiles();
        if (totalFiles.isZero()) return res.status(404).json({ message: "No case files exist." });

        const allCaseFiles = [];
        for (let i = 1; i <= totalFiles; i++) {
            const caseFile = await contract.getFile(i);
            allCaseFiles.push({
                caseNumber: caseFile.caseNumber.toString(), title: caseFile.title || "N/A",
                ipfsHash: caseFile.ipfsHash || null, dateOfJudgment: caseFile.dateOfJudgment || "N/A",
                category: caseFile.category || "N/A", judgeName: caseFile.judgeName || "N/A",
                linkedClients: caseFile.linkedClients || [], metadata: {
                    uploader: caseFile.uploader || "N/A", timestamp: caseFile.timestamp.toString() || "N/A"
                }
            });
        }

        res.json({ message: 'Case files retrieved successfully', files: allCaseFiles });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching case files', error: error.message });
    }
});

// Retrieve file metadata by title
app.get('/metadata/:title', (req, res) => {
    const metadata = fileMetadata[req.params.title];
    metadata ? res.json({ message: 'Metadata retrieved successfully', metadata }) :
        res.status(404).json({ message: `Metadata not found for title: ${req.params.title}` });
});

/** ================= User Management ================= */

// Add a new user (Lawyer or Client)
app.post('/addUser', async (req, res) => {
    const { name, userType, address } = req.body;

    if (!name || !userType) return res.status(400).json({ message: 'Name and user type are required.' });

    const existingUser = users.find(user => user.address === address);
    if (existingUser) return res.status(400).json({ message: 'This Ethereum address is already registered.' });

    users.push({ name, userType, address: address || null });
    res.status(200).json({ success: true, message: 'User added successfully.' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
