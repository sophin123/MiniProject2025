import axios from "axios";
import Login from "./Login";
import SignUp from "./SignUp";
import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from 'react-router-dom';
import api from "../api/api";

export const apiClient = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
});

console.log("Apli Client", apiClient.interceptors);

export default function AuthRoute({ children }) {
    const [signupFormData, setSignupFormData] = useState({
        username: "",
        email: "",
        phonenumber: "",
        password: ""
    });

    const [loginFormData, setLoginFormData] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");


    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
            setToken(storedToken);
        }
    }, [])


    //Configure axios interceptor to include token in requests
    useEffect(() => {
        const requestInterceptor = apiClient.interceptors.request.use(
            (config) => {
                const authToken = localStorage.getItem("authToken");
                if (authToken) {
                    config.headers['Authorization'] = `Bearer ${authToken}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        )

        const responseInterceptor = apiClient.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Handle unauthorized access, e.g., redirect to login
                    localStorage.removeItem("authToken");
                    setToken(null);
                    setUser(null);
                    navigate("/auth/login");
                    alert("Session expired. Please log in again.");
                }
                return Promise.reject(error);
            }
        )

        // Cleanup interceptors on component unmount
        return () => {
            apiClient.interceptors.request.eject(requestInterceptor);
            apiClient.interceptors.response.eject(responseInterceptor);
        };
    }, [])

    // Function to handle user signup
    const handleSignup = async () => {
        setLoading(true);
        console.log("FormData from handle SignUp", signupFormData);

        try {
            const response = await api('/auth/signup', signupFormData)
            console.log("SignUp Response:", response.message);
            navigate("/auth/login");

        } catch (error) {
            console.error("Signup error:", error);
            if (error.status === 400) {
                setError("Invalid input data. Please check your details.");
            } else if (error.status === 409) {
                setError("User already exists. Please try logging in.");
            } else {
                setError("An unexpected error occurred. Please try again later.");
            }

        } finally {
            setLoading(false);
        }
    }

    const handleLogin = async () => {
        setLoading(true);
        console.log("FormData from handle Login", loginFormData,);

        try {
            const response = await api('/auth/login', loginFormData, undefined, token, true)

            console.log("Login Response:", response);
            const newToken = response.token;
            setToken(newToken)
            localStorage.setItem("authToken", newToken);
            setUser(response.user);

            if (response.user) {
                navigate("/dashboard");
            }

        } catch (error) {
            console.error("Login error:", error);
            if (error.status === 400) {
                setError("Invalid email or password. Please try again.");
            } else {
                setError("An unexpected error occurred. Please try again later.");
            }

        } finally {
            setLoading(false);
        }
    }

    return (
        <Routes>
            <Route path="/login" element={<Login onSubmit={handleLogin} setLoginFormData={setLoginFormData} loginFormData={loginFormData} />} />
            <Route path="/signup" element={<SignUp onSubmit={handleSignup} setFormData={setSignupFormData} formData={signupFormData} />} />
        </Routes>


    )

}
