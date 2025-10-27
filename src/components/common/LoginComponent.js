import React, { useState } from 'react';
import FormGroup from './FormGroup';

const LoginComponent = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Mock Authentication Logic
        setTimeout(() => {
            if (username === 'admin' && password === 'password') {
                onLogin();
            } else {
                setError('Invalid credentials. Use admin/password.');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">Department of Motor Traffic</h1>
                    <h2 className="text-3xl font-extrabold text-indigo-600 text-center mb-6">
                        Admin Dashboard Sign In
                    </h2>
                    
                    {error && (
                        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-200" role="alert">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm space-y-4">
                            <FormGroup label="Username">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Username (admin)"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup label="Password">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Password (password)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </FormGroup>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'} transition duration-150 ease-in-out`}
                        >
                            {loading ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  Logging in...
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>
                
                <p className="text-center text-xs text-gray-500 mt-4 pb-4">
                    Mock Credentials: <strong>admin / password</strong>
                </p>
            </div>
        </div>
    );
};

export default LoginComponent;