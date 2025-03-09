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

  // backend url for hyperlink tag
  const baseURL = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    // get all files from db
    fetchFiles();
  }, [])


  const fetchFiles = async () => {
    try {
      const result = await axios.get("/files")
      console.log("Result", result);
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
      await axios.post("/upload", formData, {
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
      await axios.delete(`/file/${id}`);
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

  console.log("Selected File", selectedFile);


  return (
    <div className="App">
      <h1>File Manager</h1>

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message} </div>
      )

      }
      <div className='upload-section'>
        <input type='file' onChange={(e) => setSelectedFile(e.target.files[0])} />
        {selectedFile && (
          <div className='selected-file'>
            {/* <p>{selectedFile.name}</p> */}
            <button className='upload-button' onClick={handleUpload}>{isUploading ? 'Uploading....' : 'Upload'}</button>
          </div>
        )}
      </div>

      {
        isUploading && (
          <div className='progress-container'>
            <div className='progress-bar' style={{ width: `${uploadProgress}` }}></div>
            <span>{uploadProgress}%</span>
          </div>
        )
      }

      <div className='file-list'>
        {files.length === 0 ? (<p>No Data Found</p>) : (
          files.map(file => (
            <div key={file.id} className='file-item'>
              <div>
                <p><b>Filename</b>: {file.filename}</p>
                <p><b>Filetype</b>: {file.filetype}</p>
                <span><b>Uploaded at</b> {new Date(file.uploaded_at).toLocaleString()}</span>
              </div>
              <div className='icon-field'>
                <div className='view'>
                  {/* rel attribute helps mitigate security threat called Tabnabbing. One of the security feature */}
                  <a href={`${baseURL}/upload/${file.filename}`} target='_blank' rel="noopener noreferrer" className='download-btn'><FiEye /> </a>
                </div>
                <div className='download'>
                  <a href={`${baseURL}/download/${file.filename}`} download className='download-btn'><FiDownload /> </a>
                </div>
                <FaTrash onClick={() => handleDelete(file.id, file.filename)} color='red' />
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
