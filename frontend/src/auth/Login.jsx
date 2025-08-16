import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ onSubmit, loginFormData, setLoginFormData, loading, user }) {
    const navigate = useNavigate();

    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(loginFormData)
    };

    const handleChange = (e) => {
        setLoginFormData({
            ...loginFormData,
            [e.target.name]: e.target.value
        });
    }

    const onSwitchToSignup = () => {
        navigate("/auth/signup");
    }

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow-sm mt-5">
                        <div className="card-body p-4">
                            <h2 className="card-title text-center mb-4">Login</h2>
                            <form onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={loginFormData.email}
                                        placeholder="Enter your email"
                                        id="email"
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={loginFormData.password}
                                        id="password"
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                            <div className="text-center">
                                <p className="text-muted mb-2">Don't have an account?</p>
                                <button onClick={onSwitchToSignup} className="btn btn-outline-secondary btn-sm">Create an account</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default Login;
