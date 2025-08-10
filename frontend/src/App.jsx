import axios from 'axios'
import Dashboard from './pages/dashboard/Dashboard';
import AuthRoute from './auth/AuthRoute';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';
import api from './api/api';


function App() {


  // const api = axios.create({
  //   baseURL: API_URL,
  // });

  return (
    <Router>
      <Routes>
        <Route path="/auth/*" element={<AuthRoute />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute api={api}>
              <Dashboard api={api} />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>

  );
}

export default App;
