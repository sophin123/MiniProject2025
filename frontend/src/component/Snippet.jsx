import React, { useEffect, useState } from 'react'
import api from '../api/api';
import { FaTrash } from 'react-icons/fa';

export default function Snippet({ showNotification, notification }) {

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
            await api("/texts", { text }, undefined, token);
            showNotification("Text Added Successfully!", 'success');
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
            await api(`/texts/${id}`, undefined, 'DELETE', token);
            showNotification(`${text} Deleted Successfully`, 'success');
            handleGetText();
        } catch (error) {
            showNotification("Delete Failed", 'error');
            console.error("Delete Error", error)
        }
    }

    return (
        <div className='card'>
            <div className='card-body'>
                <h5 className='card-title mb-3'>Snippet Share</h5>
                <form onSubmit={(e) => { e.preventDefault(); handleTextUpload(); }} className='d-flex gap-2'>
                    <input
                        type="text"
                        name="text"
                        value={text}
                        placeholder="Enter your text"
                        id="snippet"
                        onChange={handleTextChange}
                        required
                        className='form-control'
                    />
                    <button type='submit' className='btn btn-primary'>Submit</button>
                </form>
                <div className='mt-3 list-group'>
                    {getText && getText.map((item) => (
                        <div id={item.id} key={item.id} className='list-group-item d-flex justify-content-between align-items-center'>
                            <span>{item.text}</span>
                            <button className='btn btn-sm btn-outline-danger' onClick={() => handleTextDelete(item.id, item.text)}>
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
