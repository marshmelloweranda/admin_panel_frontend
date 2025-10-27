import React, { useState, useEffect } from 'react';
import ApplicationsAdmin from './components/applications/ApplicationsAdmin';
import LoginComponent from './components/common/LoginComponent';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    useEffect(() => {
        const storedAuth = sessionStorage.getItem('dmt-auth');
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
        sessionStorage.setItem('dmt-auth', 'true');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('dmt-auth');
    };

    return (
        <div className="font-sans antialiased min-h-screen">
            {isAuthenticated ? (
                <>
                    <header className="bg-white shadow-lg fixed w-full z-20">
                        <div className="py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center w-full">
                            <h1 className="text-xl font-bold text-gray-900">
                                Department of Motor Traffic - Admin Panel
                            </h1>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                            >
                                Sign Out
                            </button>
                        </div>
                    </header>
                    <main className="pt-20">
                        <ApplicationsAdmin />
                    </main>
                </>
            ) : (
                <LoginComponent onLogin={handleLogin} />
            )}
        </div>
    );
};

export default App;