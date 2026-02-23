import React from 'react';


interface LoaderProps {
    type?: 'spinner' | 'overlay';
    size?: string; // e.g. '40px'
}

const Loader: React.FC<LoaderProps> = ({ type = 'spinner', size }) => {
    if (type === 'overlay') {
        return (
            <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-50">
                <div
                    className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin"
                    style={size ? { width: size, height: size } : {}}
                ></div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center w-full min-h-[200px] p-5">
            <div
                className="w-10 h-10 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin"
                style={size ? { width: size, height: size } : {}}
            ></div>
        </div>
    );
};

export default Loader;
