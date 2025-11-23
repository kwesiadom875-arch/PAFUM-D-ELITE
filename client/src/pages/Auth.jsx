import React, { useState } from 'react';
import { FaUser, FaLock, FaEnvelope, FaGoogle, FaLinkedinIn, FaFacebookF, FaTwitter } from 'react-icons/fa';
import './Auth.css';

const Auth = () => {
    const [isSignUpMode, setIsSignUpMode] = useState(false);

    const handleSignUpClick = () => {
        setIsSignUpMode(true);
    };

    const handleSignInClick = () => {
        setIsSignUpMode(false);
    };

    return (
        <div className="auth-container-wrapper">
            <div className={`auth-container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
                <div className="forms-container">
                    <div className="signin-signup">

                        {/* SIGN IN FORM */}
                        <form action="#" className="auth-form sign-in-form">
                            <h2 className="auth-title">Sign in</h2>
                            <div className="input-field">
                                <i><FaUser /></i>
                                <input type="text" placeholder="Username" />
                            </div>
                            <div className="input-field">
                                <i><FaLock /></i>
                                <input type="password" placeholder="Password" />
                            </div>
                            <button type="submit" className="btn-solid">Sign In</button>
                            <p className="social-text">Or Sign in with social platforms</p>
                            <div className="social-media">
                                <a href="#" className="social-icon"><FaFacebookF /></a>
                                <a href="#" className="social-icon"><FaTwitter /></a>
                                <a href="#" className="social-icon"><FaGoogle /></a>
                                <a href="#" className="social-icon"><FaLinkedinIn /></a>
                            </div>
                        </form>

                        {/* SIGN UP FORM */}
                        <form action="#" className="auth-form sign-up-form">
                            <h2 className="auth-title">Sign up</h2>
                            <div className="input-field">
                                <i><FaUser /></i>
                                <input type="text" placeholder="Username" />
                            </div>
                            <div className="input-field">
                                <i><FaEnvelope /></i>
                                <input type="email" placeholder="Email" />
                            </div>
                            <div className="input-field">
                                <i><FaLock /></i>
                                <input type="password" placeholder="Password" />
                            </div>
                            <button type="submit" className="btn-solid">Sign Up</button>
                            <p className="social-text">Or Sign up with social platforms</p>
                            <div className="social-media">
                                <a href="#" className="social-icon"><FaFacebookF /></a>
                                <a href="#" className="social-icon"><FaTwitter /></a>
                                <a href="#" className="social-icon"><FaGoogle /></a>
                                <a href="#" className="social-icon"><FaLinkedinIn /></a>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="panels-container">
                    <div className="panel left-panel">
                        <div className="content">
                            <h3>New here?</h3>
                            <p>
                                Join the Elite Circle and discover scents that define your essence.
                            </p>
                            <button className="btn-transparent" onClick={handleSignUpClick}>
                                Sign Up
                            </button>
                        </div>
                        <img src="https://raw.githubusercontent.com/sefyudem/Sliding-Sign-In-Sign-Up-Form/master/img/log.svg" className="image" alt="" />
                    </div>
                    <div className="panel right-panel">
                        <div className="content">
                            <h3>One of us?</h3>
                            <p>
                                Welcome back. Your signature scent awaits.
                            </p>
                            <button className="btn-transparent" onClick={handleSignInClick}>
                                Sign In
                            </button>
                        </div>
                        <img src="https://raw.githubusercontent.com/sefyudem/Sliding-Sign-In-Sign-Up-Form/master/img/register.svg" className="image" alt="" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
