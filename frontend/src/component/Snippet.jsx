import React, { useEffect, useState } from 'react'
import api from '../api/api';
import { FaTrash } from 'react-icons/fa';

export default function Snippet({ showNotification }) {

    const [text, setText] = useState("");
    const [getText, setGetText] = useState([]);
    const [token, setToken] = useState(null);

    const storageToken = localStorage.getItem("authToken");

    useEffect(() => {
        if (storageToken) {
            setToken(storageToken)
        }
    }, [])

    useEffect(() => {
        if (token) {
            handleGetText()
        }

    }, [token])

    const handleTextChange = (e) => {
        setText(e.target.value)
    }

    const handleGetText = async () => {
        try {
            const response = await api("/texts", undefined, "GET", token);
            console.log("Response snippet", response);

            setGetText(response)

        } catch (error) {
            console.log("Failed to retrieve text", error);
        }

    }

    const handleTextUpload = async () => {
        try {
            await api("/textupload", { text }, undefined, token);
            showNotification("File Uploaded Successfully!", 'success');
            setText(""); // Clear the text field after successful submission
        } catch (error) {
            showNotification('Text Add Failed');
            console.error('Text Add Failed Error', error);
        } finally {
            handleGetText()
        }

    }

    const handleTextDelete = async (id, text) => {
        try {
            await api(`/text/${id}`, undefined, 'DELETE');
            showNotification(`${text} Deleted Successfully`, 'success');
            handleGetText();
        } catch (error) {
            showNotification("Delete Failed", 'error');
            console.error("Delete Error", error)
        }
    }


    return (
        <div>
            <h1>Snippet Share</h1>
            <form>
                <input
                    type="text"
                    name="text"
                    value={text}
                    placeholder="Enter your text"
                    id="snippet"
                    onChange={handleTextChange}
                    required
                />
            </form>
            <input type='button' onClick={handleTextUpload} value="submit" />
            {getText && getText.map((item) => {
                return (
                    <div id={item.id} key={item.id}>
                        <p>{item.text}</p>
                        <div className='trash'>
                            <FaTrash onClick={() => handleTextDelete(item.id, item.text)} color='red' />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
