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
        <div>
            <form onSubmit={handleSubmit}>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <label htmlFor="email" />
                Email
                <input
                    type="email"
                    name="email"
                    value={loginFormData.email}
                    placeholder="Enter your email"
                    id="email"
                    onChange={handleChange}
                    required
                />
                <label htmlFor="password" />
                Password
                <input
                    type="password"
                    name="password"
                    value={loginFormData.password}
                    id="password"
                    onChange={handleChange}
                    required
                />
                <input type="submit" value="Submit" />
            </form>
            <button onClick={onSwitchToSignup}>Create an account</button>
        </div>
    );
}


export default Login;
