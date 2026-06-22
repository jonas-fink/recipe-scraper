import { Suspense } from 'react';
import { Routes, Route } from 'react-router';
import AppLayout from './layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import Library from './pages/Library';
import Community from './pages/Community';

const App = () => {
    return (
        <Suspense fallback={null}>
            {' '}
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/community" element={<Community />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/library" element={<Library />} />
                    </Route>
                </Route>
            </Routes>
        </Suspense>
    );
};

export default App;
