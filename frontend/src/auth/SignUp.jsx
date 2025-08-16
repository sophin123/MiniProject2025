import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp({ onSubmit, loading, setFormData, formData }) {

    const navigate = useNavigate();

    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData)
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const onSwitchToLogin = () => {
        navigate("/auth/login");
    }

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-sm mt-5">
                        <div className="card-body p-4" >
                            <h2 className="card-title text-center mb-4">Create Account</h2>
                            <form onSubmit={handleSubmit}>
                                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        placeholder="Enter your username"
                                        id="username"
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        placeholder="Enter your email"
                                        id="email"
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="phonenumber" className="form-label">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phonenumber"
                                        value={formData.phonenumber}
                                        placeholder="e.g., 0412345678 or +61412345678"
                                        id="phonenumber"
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                        pattern="^(\+61[0-9]{9}|0[0-9]{9})$"
                                        inputMode="numeric"
                                        maxLength="10"
                                        title="Enter a valid Australian mobile number (10 digits starting with 0)"
                                    />
                                    <div className="form-text small text-muted">
                                        Format: 0412345678 (10 digits)
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        placeholder="Enter your password"
                                        id="password"
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>
                            <div className="text-center">
                                <p className="text-muted mb-2">Already have an account?</p>
                                <button onClick={onSwitchToLogin} className="btn btn-outline-secondary btn-sm">Login</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default SignUp;
