import React from 'react';
import App from './App';

const EmiCalculatorTab: React.FC = () => {
    return (
        <div style={{ width: '100%', height: 'calc(100vh - 60px)', overflow: 'auto', position: 'relative' }}>
            <App />
        </div>
    );
};

export default EmiCalculatorTab;
