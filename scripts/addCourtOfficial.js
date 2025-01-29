require("dotenv").config(); // Load environment variables
const hre = require("hardhat");

async function addCourtOfficial(contractAddress, ownerSigner, addressToMakeOfficial) {
    try {
        // Validate the Ethereum address
        const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(addressToMakeOfficial.trim());
        if (!isValidAddress) {
            throw new Error("Invalid Ethereum address format. Please enter a valid address.");
        }

        console.log(`addCourtOfficial function triggered for address: ${addressToMakeOfficial.trim()}`);

        const NavinEvault = await hre.ethers.getContractAt("NavinEvault", contractAddress, ownerSigner);

        // Check if the address is already a court official
        const isAlreadyOfficial = await NavinEvault.isCourtOfficial(addressToMakeOfficial.trim());
        if (isAlreadyOfficial) {
            console.log(`Address ${addressToMakeOfficial.trim()} is already a court official.`);
            return { success: false, message: "Address is already a court official." };
        }

        // Check if the address is already a client
        const isClient = await NavinEvault.isClient(addressToMakeOfficial.trim());
        if (isClient) {
            throw new Error(`Address ${addressToMakeOfficial.trim()} is already a client and cannot be made a court official.`);
        }

        // Proceed to add the court official
        const tx = await NavinEvault.addCourtOfficial(addressToMakeOfficial.trim());
        await tx.wait(); // Wait for the transaction to be mined

        console.log(`Successfully added court official: ${addressToMakeOfficial.trim()}`);
        return { success: true, message: `Successfully added court official: ${addressToMakeOfficial.trim()}` };

    } catch (error) {
        console.error(`Error in addCourtOfficial: ${error.message}`);
        return { success: false, message: error.message };
    }
}

module.exports = addCourtOfficial;
