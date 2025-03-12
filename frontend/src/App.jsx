import { useEffect, useState } from 'react';
import axios from 'axios'
import './App.scss'

import { FiEye, FiDownload } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa'


function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgres] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })
  const [dragActive, setDragActive] = useState(false);


  // backend url for hyperlink tag
  const API_URL = process.env.REACT_APP_BASE_URL;

  console.log("Checking api url", API_URL);

  useEffect(() => {
    // get all files from db
    fetchFiles();
  }, [])

  const api = axios.create({
    baseURL: API_URL,
  });


  const fetchFiles = async () => {
    try {
      const result = await api.get("/files")
      setFiles(result.data)
    } catch (error) {
      console.log("Error fetching Files", error);
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
      await api.post("/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentageCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgres(percentageCompleted);
        }
      });
      setSelectedFile(null);
      showNotification("File Uploaded Successfully!", 'success');
      fetchFiles();
    } catch (error) {
      showNotification('Upload Failed', 'error');
      console.error('Upload Error', error);
    } finally {
      setIsUploading(false);
    }
  }


  const handleDelete = async (id, filename) => {
    try {
      await api.delete(`/file/${id}`);
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
      <h1>File Manager</h1>

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message} </div>
      )
      }

      <div className='file-section'>

        <p>DRAG OR DROP FILES ANYWHERE ON PAGE OR</p>
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
        {files.length === 0 ? (<p>No Data Found</p>) : (
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
    </div >
  );
}

export default App;
