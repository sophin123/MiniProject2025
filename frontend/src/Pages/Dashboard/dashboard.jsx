import { useEffect, useState } from 'react';
import "./Dashboard.scss"

import { FiEye, FiDownload } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa'
import { API_URL } from '../../api/api';
import api from '../../api/api';
import { useUser } from '../../ContextProvider';
import Snippet from '../../component/Snippet';


export default function Dashboard() {

    const [files, setFiles] = useState([]);

    console.log("Files output", files);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgres] = useState(0);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' })
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const fileSize = "100MB"
    const [token, setToken] = useState(null);

    const { user } = useUser();

    const storedToken = localStorage.getItem("authToken");

    useEffect(() => {
        if (storedToken) {
            setToken(storedToken);
        }
    }, [storedToken])

    useEffect(() => {
        if (token) {
            fetchFiles();
        }
    }, [token]);



    const fetchFiles = async () => {
        const authToken = token;
        console.log("Using auth token for fetchFiles", !!authToken);
        try {
            if (!authToken) {
                throw { message: "Missing auth token" };
            }
            const result = await api("/files", undefined, 'GET', authToken)
            setFiles(result);
        } catch (error) {
            console.log("Error fetching Files", error);
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) {
            showNotification("Please select a file first", "error");
            return;
        }

        setIsUploading(true);
        setUploadProgres(0);


        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await api("/upload", formData, undefined, token, undefined, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // This is used to track the upload progress
                onUploadProgress: (progressEvent) => {
                    const percentageCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgres(percentageCompleted);
                }
            });
            setSelectedFile(null);
            showNotification("File Uploaded Successfully!", 'success');
            fetchFiles();
        } catch (error) {
            showNotification('Upload Failed');
            console.error('Upload Error', error);
        } finally {
            setIsUploading(false);
        }
    }

    const handleDelete = async (id, filename) => {
        try {
            await api(`/file/${id}`, undefined, 'DELETE');
            showNotification(`${filename} Deleted Successfully`, 'success');
            fetchFiles();

        } catch (error) {
            showNotification("Delete Failed", 'error');
            console.error("Delete Error", error)
        }

    }


    const showNotification = (message, type) => {
        setNotification({ show: true, message, type })
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' })
        }, 3000)

    }

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(e.type);

        if (e.type === 'dragover' || e.type === 'dragenter') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        window.location.href = "/auth/login";
    }

    const getFileIcon = (filetype) => {
        if (filetype.includes('image')) return '🖼️';
        if (filetype.includes('pdf')) return '📄';
        if (filetype.includes('document') || filetype.includes('word')) return '📝';
        if (filetype.includes('spreadsheet') || filetype.includes('excel')) return '📊';
        if (filetype.includes('video')) return '🎬';
        if (filetype.includes('audio')) return '🎵';
        if (filetype.includes('zip') || filetype.includes('compressed')) return '🗜️';
        if (filetype.includes('text')) return '📝';
        return '📁';
    };


    return (
        <div className={`App upload-section ${dragActive ? 'drag-active' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <h1>LAN File Share </h1>
            <i>Welcome {user?.username}</i>
            <p>Maximum file that can be share is {fileSize}</p>

            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message} </div>
            )
            }

            <div className='file-section'>

                <p>DRAG DROP FILES ANYWHERE ON PAGE OR</p>
                <label className='file-input-label'>
                    Browse Files
                    <input className='file-input' type='file' onChange={(e) => setSelectedFile(e.target.files[0])} />
                </label>
                {selectedFile && (
                    <div className='selected-file'>
                        <p>{selectedFile.name}</p>
                        <button className='upload-button'
                            onClick={handleUpload}
                        >
                            {isUploading ? 'Uploading....' : 'Upload'}
                        </button>
                    </div>
                )}
            </div>

            {
                isUploading && (
                    <div className='progress-container'>
                        <div className='progress-bar' style={{ width: `${uploadProgress}%` }}></div>
                        <span>{uploadProgress}%</span>
                    </div>
                )
            }

            <div className='file-list'>

                {loading ? (<p>Loading......</p>) : files.length === 0 ? (<p>No Data Found</p>) : (
                    files.map(file => (
                        <div key={file.id} className='file-item'>
                            <div>
                                <p><b>Filename</b>: {file.filename} {getFileIcon(file.filetype)}</p>
                                <p><b>Filetype</b>: {file.filetype}</p>
                                <span><b>Uploaded at</b> {new Date(file.uploaded_at).toLocaleString()}</span>
                            </div>
                            <div className='icon-field'>
                                <div className='view'>
                                    {/* rel attribute helps mitigate security threat called Tabnabbing. One of the security feature */}
                                    <a href={`${API_URL}/upload/${file.filename}`} target='_blank' rel="noopener noreferrer" className='download-btn'><FiEye /> </a>
                                </div>
                                <div className='download'>
                                    <a href={`${API_URL}/download/${file.filename}`} download className='download-btn'><FiDownload /> </a>
                                </div>
                                <div className='trash'>
                                    <FaTrash onClick={() => handleDelete(file.id, file.filename)} color='red' />
                                </div>
                            </div>
                        </div>

                    )
                    )
                )}
            </div>

            <Snippet showNotification={showNotification} />

            <footer>
                <button onClick={handleLogout}>Logout</button>
            </footer>
        </div >
    )
}
