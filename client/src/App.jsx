import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const [viewPanel, setViewPanel] = useState(false);

  // Store image path
  const [images, setImages] = useState([]);
  const [image, setImage] = useState("");

  // useEffect to grab the picture
  useEffect(() => {
    axios
      .get("/api/images", {
        headers: {
          "Content-Type": "application/json charset=UTF-8",
          Accept: "application/json, text/html",
        },
      })
      .then((response) => {
        console.log(response.data.image);
        setImages(response.data.image);
      });
  }, []);

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await axios.post("/api/upload", formData);
      alert(response.data.msg); // Success message
      window.location.reload();
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Upload failed";
      alert(errorMsg);
    }
  };

  const handleViewImage = (image) => {
    console.log("id is", image);
    setViewPanel(true);
    setImage(image);
  };

  return (
    <div className="container">
      <h1 className="title">MySQL Demo To Upload and View Images</h1>
      <div className="context-container">
        <h1>File Upload</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleImageUpload();
          }}
        >
          <input
            type="file"
            name="image"
            accept="image/*"
            multiple={false}
            onChange={handleImageChange}
          />
          <button type="submit">Upload</button>
          {alertMessage && <span color="red">{alertMessage}</span>}
        </form>

        <div className="sub-button-container">
          {images &&
            images.map((image) => {
              return (
                <button
                  className="sub-button"
                  key={image.id}
                  onClick={() => handleViewImage(image)}
                >
                  {image.id}
                </button>
              );
            })}
        </div>
        <div className="view-panel">
          {viewPanel && (
            <img
              className="image-container"
              key={image.id}
              src={`/api/${image.cover}`}
              alt="image"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
