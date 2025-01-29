const readline = require('readline');
const Web3 = require('web3'); // Import Web3
const fs = require('fs'); // File system to read ABI
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Set up Web3 and connect to the local network
const web3 = new Web3("http://127.0.0.1:8545"); // Localhost URL

// Read the contract ABI and address
const contractABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts/contracts/YourContract.sol/YourContract.json'), 'utf8')).abi;
const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your deployed contract address

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function linkClients() {
    // Get case title and client addresses
    rl.question('Enter the case title to link clients to: ', async (caseTitle) => {
        rl.question('Enter the client addresses to link (comma-separated): ', async (clientAddresses) => {
            // Split and clean the input client addresses
            const clients = clientAddresses.split(',').map(client => client.trim());

            // Get the list of accounts to use for the transaction
            const accounts = await web3.eth.getAccounts();
            const senderAccount = accounts[0]; // Use the first account

            try {
                // Call the linkClients function by passing case title and client addresses
                const tx = await contract.methods.linkClients(caseTitle, clients).send({ from: senderAccount });
                console.log('Transaction sent, waiting for confirmation...');
                await tx; // Wait for the transaction to be mined
                console.log('Clients linked successfully!');
            } catch (error) {
                console.error('Error linking clients:', error);
            }

            rl.close();
        });
    });
}

linkClients();
