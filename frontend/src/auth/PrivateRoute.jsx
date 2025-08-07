import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

export default function PrivateRoute({ children, api }) {
    // Check if the user is authenticated by checking for a token in localStorage
    const token = localStorage.getItem("authToken");
    const navigate = useNavigate();

    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            // If no token, redirect to login
            navigate("/auth/login", { replace: true });
            return;
        }

        const verifyToken = async () => {
            try {
                // Make an API call to verify the token
                const response = await api("/dashboard", null, 'GET', token);

                if (response.user) {
                    setIsVerified(true);
                }

            } catch (error) {
                console.error("Token verification failed:", error);
                // If the token is invalid, redirect to the login page
                localStorage.removeItem("authToken");
                navigate("/auth/login", { replace: true });
            } finally {
                setLoading(false);
            }
        }

        verifyToken();
    }, [navigate, token, api]);

    if (loading) {
        return <div>Loading...</div>; // You can replace this with a loading spinner or any other loading indicator
    }

    return isVerified ? children : null;
};
