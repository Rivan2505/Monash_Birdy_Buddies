// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/loginPage';
import HomePage from './pages/homePage';
import ConfirmUserPage from './pages/confirmUserPage';
import UploadPage from './pages/uploadPage';
import BrowsePage from './pages/browsePage';
import './App.css'


const App = () => {
  const isAuthenticated = () => {
    const accessToken = sessionStorage.getItem('accessToken');
    return !!accessToken;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated() ? <Navigate replace to="/home" /> : <Navigate replace to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/confirm" element={<ConfirmUserPage />} />
        <Route path="/home" element={isAuthenticated() ? <HomePage /> : <Navigate replace to="/login" />} />
        <Route path="/upload" element={isAuthenticated() ? <UploadPage /> : <Navigate replace to="/login" />} />
        <Route path="/browse" element={isAuthenticated() ? <BrowsePage /> : <Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
