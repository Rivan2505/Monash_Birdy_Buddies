// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmSignUp } from '../authService';
import '../styles/confirmUserPage.css';
import { useToast } from './ToastContext';

const ConfirmUserPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  // eslint-disable-next-line
  const [email, setEmail] = useState(location.state?.email || '');
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await confirmSignUp(email, confirmationCode);
      showToast("Account confirmed successfully! Sign in on next page.", 'success');
      navigate('/login');
    } catch (error) {
      showToast(`Failed to confirm account: ${error}`, 'error');
    }
  };

return (
  <div className="loginForm">
    <h2>Confirm Account</h2>
    <form onSubmit={handleSubmit} className="form-fields">
      <div className="input-group">
        <input
          className="inputText large-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
      </div>
      <div className="input-group">
        <input
          className="inputText large-input"
          type="text"
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
          placeholder="Confirmation Code"
          required />
      </div>
      <button type="submit" className="primary-button large-btn">Confirm Account</button>
    </form>
  </div>
);

};

export default ConfirmUserPage;
