import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import AuthPage from './components/AuthPage';
import LawyerDashboard from './components/LawyerDashboard';
import ClientDashboard from './components/ClientDashboard';
import FileManagement from './components/FileManagement';
import FetchFileComponent from './components/FetchFileComponent';

function App() {
  // State to manage the Ethereum address
  const [ethereumAddress, setEthereumAddress] = useState('');

  return (
    <Router>
      <Routes>
        {/* Homepage Route */}
        <Route path="/" element={<Homepage />} />
        
        {/* AuthPage for Login/Signup */}
        <Route 
          path="/auth" 
          element={<AuthPage setEthereumAddress={setEthereumAddress} />} 
        />
        
        {/* Lawyer Dashboard with state passing */}
        <Route 
          path="/lawyer-dashboard" 
          element={<LawyerDashboard ethereumAddress={ethereumAddress} />} 
        />
        
        {/* Client Dashboard with state passing */}
        <Route 
          path="/client-dashboard" 
          element={<ClientDashboard />} 
        />
        
        {/* File Management */}
        <Route path="/file-management" element={<FileManagement />} />
        
        {/* Fetch File Component */}
        <Route path="/fetch-file" element={<FetchFileComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
