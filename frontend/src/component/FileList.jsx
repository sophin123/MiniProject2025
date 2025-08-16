
import React, { useEffect, useState } from 'react'
import { useUser } from '../ContextProvider';
import api, { API_URL } from '../api/api';
import { FaTrash } from 'react-icons/fa';
import { FiDownload, FiEye } from 'react-icons/fi';

export default function FileList({ showNotification, notification }) {

    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgres] = useState(0);
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
            await api(`/file/${id}`, undefined, 'DELETE', token);
            showNotification(`${filename} Deleted Successfully`, 'success');
            fetchFiles();

        } catch (error) {
            showNotification("Delete Failed", 'error');
            console.error("Delete Error", error)
        }

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
        <div className={`card ${dragActive ? 'border-primary' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <div className="card-body">
                <h5 className='card-title mb-3'>File Share</h5>
                <p className="small text-secondary">Maximum upload file size: {fileSize}</p>

                <div className="mb-3">
                    <p className="mb-2">Drag & drop files anywhere on the page or</p>
                    <label className='btn btn-outline-primary'>
                        Browse Files
                        <input className='d-none' type='file' onChange={(e) => setSelectedFile(e.target.files[0])} />
                    </label>
                </div>

                {selectedFile && (
                    <div className='d-flex align-items-center gap-3 mb-3'>
                        <p className='mb-0'>{selectedFile.name}</p>
                        <button className='btn btn-primary' onClick={handleUpload} disabled={isUploading}>
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                )}

                {isUploading && (
                    <div className='progress mb-3' style={{ height: '8px' }}>
                        <div className='progress-bar' role='progressbar' style={{ width: `${uploadProgress}%` }} aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                )}

                <div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : files.length === 0 ? (
                        <div className='alert alert-secondary mb-0'>No files found</div>
                    ) : (
                        <div className='list-group'>
                            {files.map(file => (
                                <div key={file.id} className='list-group-item d-flex justify-content-between align-items-start'>
                                    <div className='me-3'>
                                        <div className='fw-semibold'>
                                            {getFileIcon(file.filetype)} {file.filename}
                                        </div>
                                        <div className='small text-secondary'>
                                            {file.filetype} • {new Date(file.uploaded_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className='d-flex align-items-center gap-2'>
                                        <a href={`${API_URL}/upload/${file.filename}`} target='_blank' rel="noopener noreferrer" className='btn btn-sm btn-outline-secondary' title='View'><FiEye /></a>
                                        <a href={`${API_URL}/download/${file.filename}`} download className='btn btn-sm btn-outline-success' title='Download'><FiDownload /></a>
                                        <button className='btn btn-sm btn-outline-danger' onClick={() => handleDelete(file.id, file.filename)} title='Delete'>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
