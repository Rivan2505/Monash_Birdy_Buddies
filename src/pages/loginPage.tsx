// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../authService';
import '../styles/loginPage.css';
import { useToast } from './ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSignIn = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const session = await signIn(email, password);
      console.log('Sign in successful', session);
      if (session && typeof session.AccessToken !== 'undefined') {
        sessionStorage.setItem('accessToken', session.AccessToken);
        if (sessionStorage.getItem('accessToken')) {
          showToast('Login successful!', 'success');
          window.location.href = '/home';
        } else {
          showToast('Session token was not set properly.', 'error');
        }
      } else {
        showToast('SignIn session or AccessToken is undefined.', 'error');
      }
    } catch (error) {
      showToast(`Sign in failed: ${error}`, 'error');
    }
  };

  const handleSignUp = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    try {
      await signUp(email, password);
      showToast('Sign up successful! Please confirm your email.', 'success');
      navigate('/confirm', { state: { email } });
    } catch (error) {
      showToast(`Sign up failed: ${error}`, 'error');
    }
  };

  return (
    <div className="login-container">
      <div className="loginForm">
        <div className="logo-container">
          <h1>Monash Birdy Buddies</h1>
        </div>
        <h4>{isSignUp ? 'Join our bird watching community' : 'Welcome back to the nest!'}</h4>
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="form-fields">
          <div className="input-group">
            <input
              className="inputText large-input"
              id="email"
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
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <div className="show-password-checkbox">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
              />
              <label htmlFor="showPassword">Show password</label>
            </div>
          </div>
          {isSignUp && (
            <div className="input-group">
              <input
                className="inputText large-input"
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
              />
              <div className="show-password-checkbox">
                <input
                  type="checkbox"
                  id="showConfirmPassword"
                  checked={showConfirmPassword}
                  onChange={() => setShowConfirmPassword((prev) => !prev)}
                />
                <label htmlFor="showConfirmPassword">Show confirm password</label>
              </div>
            </div>
          )}
          <button type="submit" className="primary-button large-btn">
            {isSignUp ? 'Join the Flock' : 'Sign In'}
          </button>
        </form>
        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          className="secondary-button large-btn"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'New to Birdy Buddies? Sign Up'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
