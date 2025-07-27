import React from 'react';

const Loader = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
            {message && <p className="mt-4 text-gray-600">{message}</p>}
        </div>
    );
};

export default Loader;