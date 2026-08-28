import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { IncidentList } from './pages/IncidentList';
import { IncidentDetails } from './pages/IncidentDetails';
import { Profile } from './pages/Profile';
import { Investigations } from './pages/Investigations';
import { Events } from './pages/Events';
import { Findings } from './pages/Findings';
import { Chains } from './pages/Chains';
import { Identities } from './pages/Identities';
import { Assets } from './pages/Assets';
import { Intel } from './pages/Intel';
import { Mitre } from './pages/Mitre';
import { Responses } from './pages/Responses';
import { Approvals } from './pages/Approvals';
import { Audit } from './pages/Audit';
import { Search } from './pages/Search';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="incidents" element={<IncidentList />} />
            <Route path="incidents/:id" element={<IncidentDetails />} />
            <Route path="investigations" element={<Investigations />} />
            <Route path="events" element={<Events />} />
            <Route path="findings" element={<Findings />} />
            <Route path="attack-chains" element={<Chains />} />
            <Route path="identities" element={<Identities />} />
            <Route path="assets" element={<Assets />} />
            <Route path="threat-intel" element={<Intel />} />
            <Route path="mitre" element={<Mitre />} />
            <Route path="response-center" element={<Responses />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="audit" element={<Audit />} />
            <Route path="search" element={<Search />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
