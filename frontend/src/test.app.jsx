import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.scss';
import { FiEye, FiDownload, FiUpload } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';

function App() {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [hoveredFileId, setHoveredFileId] = useState(null);

    const baseURL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const result = await axios.get("/files");
            setFiles(result.data);
        } catch (error) {
            console.log("Error fetching Files", error);
            showNotification('Failed to load files', 'error');
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showNotification('Please select a file first', 'error');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await axios.post("/upload", formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            setSelectedFile(null);
            showNotification('File uploaded successfully!', 'success');
            fetchFiles();
        } catch (error) {
            showNotification('Upload failed', 'error');
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id, filename) => {
        try {
            await axios.delete(`/file/${id}`);
            showNotification(`${filename} deleted successfully`, 'success');
            fetchFiles();
        } catch (error) {
            showNotification('Delete failed', 'error');
            console.error("Delete error:", error);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

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
        <div className="App">
            <h1>File Manager</h1>

            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div
                className={`upload-section ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="upload-icon">
                    <FiUpload size={40} />
                </div>
                <p>Drag & drop files here or</p>
                <label className="file-input-label">
                    Browse Files
                    <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="file-input"
                    />
                </label>
                {selectedFile && (
                    <div className="selected-file">
                        <p>{selectedFile.name}</p>
                        <button
                            className="upload-button"
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Upload File'}
                        </button>
                    </div>
                )}

                {isUploading && (
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                        <span>{uploadProgress}%</span>
                    </div>
                )}
            </div>

            <h2>Your Files</h2>
            <div className="file-list">
                {files.length === 0 ? (
                    <div className="empty-state">
                        <p>No files found</p>
                        <p className="empty-description">Upload your first file to get started</p>
                    </div>
                ) : (
                    files.map(file => (
                        <div
                            key={file.id}
                            className="file-item"
                            onMouseEnter={() => setHoveredFileId(file.id)}
                            onMouseLeave={() => setHoveredFileId(null)}
                        >
                            <div className="file-icon">
                                {getFileIcon(file.filetype)}
                            </div>
                            <div className="file-details">
                                <p className="file-name">{file.filename}</p>
                                <p className="file-type">{file.filetype}</p>
                                <p className="upload-date">Uploaded: {new Date(file.uploaded_at).toLocaleString()}</p>
                            </div>
                            <div className="file-actions">
                                <div className="action-buttons-group">
                                    <a
                                        href={`${baseURL}/upload/${file.filename}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="action-button view"
                                        title="View file"
                                    >
                                        <FiEye />
                                    </a>
                                    <a
                                        href={`${baseURL}/download/${file.filename}`}
                                        download
                                        className="action-button download"
                                        title="Download file"
                                    >
                                        <FiDownload />
                                    </a>
                                    <button
                                        className="action-button delete"
                                        onClick={() => handleDelete(file.id, file.filename)}
                                        title="Delete file"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;