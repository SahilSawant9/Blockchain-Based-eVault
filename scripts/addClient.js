require("dotenv").config(); // Load environment variables
const hre = require("hardhat");

async function addClient(contractAddress, ownerSigner, addressToMakeClient) {
    try {
        // Validate the Ethereum address
        const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(addressToMakeClient.trim());
        if (!isValidAddress) {
            throw new Error("Invalid Ethereum address format. Please enter a valid address.");
        }

        console.log(`addClient function triggered for address: ${addressToMakeClient.trim()}`);

        const NavinEvault = await hre.ethers.getContractAt("NavinEvault", contractAddress, ownerSigner);

        // Check if the address is already a client
        const isAlreadyClient = await NavinEvault.isClient(addressToMakeClient.trim());
        if (isAlreadyClient) {
            console.log(`Address ${addressToMakeClient.trim()} is already a client.`);
            return { success: false, message: "Address is already a client." };
        }

        // Check if the address is already a court official
        const isCourtOfficial = await NavinEvault.isCourtOfficial(addressToMakeClient.trim());
        if (isCourtOfficial) {
            throw new Error(`Address ${addressToMakeClient.trim()} is already a court official and cannot be made a client.`);
        }

        // Proceed to add the client
        const tx = await NavinEvault.addClient(addressToMakeClient.trim());
        await tx.wait(); // Wait for the transaction to be mined

        console.log(`Successfully added client: ${addressToMakeClient.trim()}`);
        return { success: true, message: `Successfully added client: ${addressToMakeClient.trim()}` };

    } catch (error) {
        console.error(`Error in addClient: ${error.message}`);
        return { success: false, message: error.message };
    }
}

module.exports = addClient;
