import { useState } from 'react';


import Snippet from '../../component/Snippet';
import FileList from '../../component/FileList';
import { useUser } from '../../ContextProvider';


export default function Dashboard() {

    const [notification, setNotification] = useState({ show: false, message: '', type: '' })
    const { user } = useUser();

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type })
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' })
        }, 3000)
    }

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
    }

    return (
        <>
            <nav className="navbar navbar-light bg-light mb-4 shadow-sm">
                <div className="container">
                    <span className="navbar-brand mb-0 h1">LAN File Share v2</span>
                    <div className="ms-auto d-flex align-items-center gap-3">
                        <span className="text-muted">Welcome {user?.username}</span>
                        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>
            <div className="container py-0 pb-4">
                <div className="row g-4">
                    <div className="col-12">
                        {notification.show && (
                            <div className={`alert alert-${notification.type === 'error' ? 'danger' : notification.type}`} role="alert">
                                {notification.message}
                            </div>
                        )}
                    </div>
                    <div className="col-lg-7">
                        <FileList showNotification={showNotification} notification={notification} />
                    </div>
                    <div className="col-lg-5">
                        <Snippet showNotification={showNotification} notification={notification} />
                    </div>
                </div>
            </div>
        </>

    )
}
