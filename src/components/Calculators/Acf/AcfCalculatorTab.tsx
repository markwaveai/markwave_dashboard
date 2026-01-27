import React from 'react';
import { AcfCalculatorApp } from '../Emi/App';

const AcfCalculatorTab: React.FC = () => {
    return (
        <div style={{ width: '100%', height: 'calc(100vh - 60px)', overflow: 'auto', position: 'relative' }}>
            <AcfCalculatorApp />
        </div>
    );
};

export default AcfCalculatorTab;
