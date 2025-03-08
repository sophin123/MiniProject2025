import { useEffect, useState } from 'react';
import axios from 'axios'
import './App.scss'

import { FiEye, FiDownload } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa'

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

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
    const formData = new FormData();
    formData.append('file', selectedFile);

    await axios.post("/upload", formData)
    fetchFiles();
  }


  const handleDelete = async (id) => {
    await axios.delete(`/file/${id}`);
    fetchFiles();
  }

  return (
    <div className="App">
      <div className='upload-section'>
        <input type='file' onChange={(e) => setSelectedFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload</button>
      </div>

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
                <FaTrash onClick={() => handleDelete(file.id)} color='red' />
              </div>
            </div>

          )
          )
        )}
      </div>
    </div>
  );
}

export default App;
