import { useEffect, useState } from 'react';
import axios from 'axios'
import Dashboard from './Pages/Dashboard/dashboard';
// import Login from './Pages/Login/login';


function App() {

  // backend url for hyperlink tag
  const API_URL = process.env.REACT_APP_BASE_URL;
  console.log("Checking api url", API_URL);

  const api = axios.create({
    baseURL: API_URL,
  });

  return (
    <>
      <Dashboard api={api} />
    </>

  );
}

export default App;
