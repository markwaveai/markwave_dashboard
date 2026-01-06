import React from 'react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-[1500px] mx-auto">
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
