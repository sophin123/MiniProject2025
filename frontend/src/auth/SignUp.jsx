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
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username" />
                Username
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    placeholder="Enter your username"
                    id="username"
                    onChange={handleChange}
                    required
                />

                <label htmlFor="email" />
                Email
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter your email"
                    id="email"
                    onChange={handleChange}
                    required
                />

                <label htmlFor="phonenumber" />
                Phone Number
                <input
                    type="number"
                    name="phonenumber"
                    value={formData.phonenumber}
                    placeholder="Enter your phonenumber"
                    id="phonenumber"
                    onChange={handleChange}
                    required
                />

                <label htmlFor="password" />
                Password
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    id="password"
                    onChange={handleChange}
                    required
                />
                <input type="submit" value="Submit" />
            </form>
            <p>Already have an account?</p>
            <button onClick={onSwitchToLogin}>Login</button>
        </div>
    );
}


export default SignUp;
