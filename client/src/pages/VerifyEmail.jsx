import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import './VerifyEmail.css';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        axios.get(`${API_URL}/api/auth/verify-email?token=${token}`)
            .then(res => {
                setStatus('success');
                setMessage(res.data.message);
            })
            .catch(err => {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed');
            });
    }, [searchParams]);

    return (
        <div className="verify-email-container">
            <div className="verify-card glass-card">
                {status === 'verifying' && (
                    <>
                        <div className="spinner"></div>
                        <h2>Verifying your email...</h2>
                        <p>Please wait while we confirm your account.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="success-icon">✓</div>
                        <h2 className="success-title">Email Verified!</h2>
                        <p className="success-message">{message}</p>
                        <Link to="/auth" className="btn-primary">
                            Sign In Now
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="error-icon">✗</div>
                        <h2 className="error-title">Verification Failed</h2>
                        <p className="error-message">{message}</p>
                        <Link to="/auth" className="btn-primary">
                            Back to Sign In
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
