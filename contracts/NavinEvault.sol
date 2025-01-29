    //SPDX-License-Identifier: MIT
    pragma solidity ^0.8.24;

    contract NavinEvault {
        address public owner;
        mapping(address => bool) private courtOfficials;
        mapping(address => bool) private clients;

        struct CaseFile {
            address uploader;
            string ipfsHash;
            string title;
            string dateOfJudgment;
            string caseNumber;
            string category;
            string judgeName;
            address[] linkedClients;
            uint256 timestamp;
            address linkedCourtOfficial;
        }

        mapping(uint256 => CaseFile) public caseFiles;
        mapping(uint256 => mapping(address => bool)) private linkedClientsMap;
        uint256 public totalCaseFiles;

        event FileUploaded(
            address indexed uploader,
            uint256 indexed fileId,
            string ipfsHash,
            string title,
            string dateOfJudgment,
            string caseNumber,
            string category,
            string judgeName,
            uint256 timestamp,
            address[] linkedClients,
            address linkedCourtOfficial
        );

        event ClientLinked(uint256 indexed fileId, address client);
        event CourtOfficialLinked(uint256 indexed fileId, address courtOfficial);
        event CourtOfficialReplaced(uint256 indexed fileId, address newCourtOfficial);

        modifier onlyOwner() {
            require(msg.sender == owner, "Only the owner can perform this action");
            _;
        }

        modifier onlyCourtOfficial() {
            require(courtOfficials[msg.sender], "Only court officials can upload files");
            _;
        }

        modifier onlyAuthorizedUploader() {
            require(courtOfficials[msg.sender] || clients[msg.sender], "Only authorized users can upload files");
            _;
        }

        constructor() {
            owner = msg.sender;
        }

        // Register court officials and clients
        function addCourtOfficial(address _official) public onlyOwner {
            courtOfficials[_official] = true;
        }

        function removeCourtOfficial(address _official) public onlyOwner {
            courtOfficials[_official] = false;
        }

        function addClient(address _client) public onlyOwner {
            clients[_client] = true;
        }

        function removeClient(address _client) public onlyOwner {
            clients[_client] = false;
        }

        function isCourtOfficial(address _official) public view returns (bool) {
            return courtOfficials[_official];
        }

        function isClient(address _client) public view returns (bool) {
            return clients[_client];
        }

        // Allow authorized users (court officials or clients) to upload files
        function uploadFile(
            string memory _ipfsHash,
            string memory _title,
            string memory _dateOfJudgment,
            string memory _caseNumber,
            string memory _category,
            string memory _judgeName,
            address[] memory _linkedClients
        ) public onlyAuthorizedUploader {
            require(bytes(_ipfsHash).length > 0, "IPFS hash is required");
            require(_linkedClients.length > 0, "At least one client must be linked");

            totalCaseFiles++;
            address courtOfficial = courtOfficials[msg.sender] ? msg.sender : address(0);
            
            caseFiles[totalCaseFiles] = CaseFile({
                uploader: msg.sender,
                ipfsHash: _ipfsHash,
                title: _title,
                dateOfJudgment: _dateOfJudgment,
                caseNumber: _caseNumber,
                category: _category,
                judgeName: _judgeName,
                linkedClients: _linkedClients,
                timestamp: block.timestamp,
                linkedCourtOfficial: courtOfficial
            });

            for (uint256 i = 0; i < _linkedClients.length; i++) {
                linkedClientsMap[totalCaseFiles][_linkedClients[i]] = true; // Link client
            }

            emit FileUploaded(
                msg.sender,
                totalCaseFiles,
                _ipfsHash,
                _title,
                _dateOfJudgment,
                _caseNumber,
                _category,
                _judgeName,
                block.timestamp,
                _linkedClients,
                courtOfficial
            );
        }

        // Link clients
        function linkClients(uint256 _fileId, address[] memory _clients) public onlyCourtOfficial {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");
            require(caseFiles[_fileId].linkedCourtOfficial == msg.sender, "You are not the linked court official for this case");

            for (uint256 i = 0; i < _clients.length; i++) {
                address client = _clients[i];
                require(!linkedClientsMap[_fileId][client], "Client is already linked to this case");
                linkedClientsMap[_fileId][client] = true; // Link client
                caseFiles[_fileId].linkedClients.push(client); // Add to array for external visibility
                emit ClientLinked(_fileId, client);
            }
        }

        // Replace court official for the case
    function replaceCourtOfficial(uint256 _fileId, address _newCourtOfficial) public {
        require(
            courtOfficials[msg.sender] || caseFiles[_fileId].linkedCourtOfficial == msg.sender,
            "You are not authorized to replace the official"
        );
        require(courtOfficials[_newCourtOfficial], "New official must be registered");

        caseFiles[_fileId].linkedCourtOfficial = _newCourtOfficial;

        emit CourtOfficialReplaced(_fileId, _newCourtOfficial);
    }

        // Clients or court officials can get case file details
        function getFile(uint256 _fileId) public view returns (
            address uploader,
            string memory ipfsHash,
            string memory title,
            string memory dateOfJudgment,
            string memory caseNumber,
            string memory category,
            string memory judgeName,
            address[] memory linkedClients,
            uint256 timestamp,
            address linkedCourtOfficial
        ) {
            require(_fileId > 0 && _fileId <= totalCaseFiles, "Invalid file ID");

            // Check if the caller is a court official or a linked client
            require(courtOfficials[msg.sender] || linkedClientsMap[_fileId][msg.sender], "Access denied: You are not linked to this case");

            CaseFile storage file = caseFiles[_fileId];
            return (
                file.uploader,
                file.ipfsHash,
                file.title,
                file.dateOfJudgment,
                file.caseNumber,
                file.category,
                file.judgeName,
                file.linkedClients,
                file.timestamp,
                file.linkedCourtOfficial
            );
        }

        // Search by title (clients can search for their own cases)
    function searchByTitle(string memory _title) public view returns (CaseFile[] memory) {
        uint256 matchCount = 0;

        // First, count how many case files match the title and are linked to the client
        for (uint256 i = 1; i <= totalCaseFiles; i++) {
            if (
                keccak256(abi.encodePacked(caseFiles[i].title)) == keccak256(abi.encodePacked(_title)) &&
                linkedClientsMap[i][msg.sender]
            ) {
                matchCount++;
            }
        }

        // Create an array to hold the matching case files
        CaseFile[] memory matchingFiles = new CaseFile[](matchCount);
        uint256 index = 0;

        // Populate the matchingFiles array with the matching case files where the client is linked
        for (uint256 i = 1; i <= totalCaseFiles; i++) {
            if (
                keccak256(abi.encodePacked(caseFiles[i].title)) == keccak256(abi.encodePacked(_title)) &&
                linkedClientsMap[i][msg.sender]
            ) {
                matchingFiles[index] = caseFiles[i];
                index++;
            }
        }

        return matchingFiles;
    }
    }

