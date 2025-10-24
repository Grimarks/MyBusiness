import React from 'react';

const Loader = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-orange-500"></div>
            {message && <p className="mt-4 text-gray-600 text-sm sm:text-base">{message}</p>}
        </div>
    );
};

export default Loader;