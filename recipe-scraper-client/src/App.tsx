import { Suspense } from 'react';
import { Routes, Route } from 'react-router';
import AppLayout from './layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import Library from './pages/Library';
import RecipeDetail from './pages/RecipeDetail';
import Community from './pages/Community';
import CommunityDetail from './pages/CommunityDetail';

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
                    <Route
                        path="/community/:id"
                        element={<CommunityDetail />}
                    />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/library" element={<Library />} />
                        <Route path="/library/:id" element={<RecipeDetail />} />
                    </Route>
                </Route>
            </Routes>
        </Suspense>
    );
};

export default App;
