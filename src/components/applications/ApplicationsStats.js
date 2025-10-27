import React from 'react';

const ApplicationsStats = ({ stats, loading }) => {
    const statsData = [
        { name: 'Total Applications', value: stats.total || 0, color: 'bg-indigo-600', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20v-2c0-.656-.126-1.283-.356-1.857M6 18c-2.347 0-4-1.867-4-3.5S3.653 11 6 11c3.122 0 5 1.766 5 3.5S9.122 18 6 18zm0 0v-2.5a2.5 2.5 0 005 0V18' },
        { name: 'Pending Review', value: stats.pending || 0, color: 'bg-yellow-500', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        { name: 'Approved', value: stats.approved || 0, color: 'bg-green-600', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Rejected', value: stats.rejected || 0, color: 'bg-red-600', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat) => (
                <div key={stat.name} className={`bg-white rounded-xl shadow-lg p-5 border-l-4 ${stat.color.replace('bg-', 'border-')}`}>
                    <div className="flex items-center">
                        <div className={`flex-shrink-0 p-3 rounded-full ${stat.color} bg-opacity-10`}>
                            <svg className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stat.value}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ApplicationsStats;