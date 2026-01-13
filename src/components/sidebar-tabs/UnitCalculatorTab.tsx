import React from 'react';
import UnitCalculatorApp from '../unit-calculator/UnitCalculatorApp';

const UnitCalculatorTab: React.FC = () => {
    return (
        <div style={{ width: '100%', height: 'calc(100vh - 60px)', overflow: 'hidden', position: 'relative' }}>
            <UnitCalculatorApp />
        </div>
    );
};

export default UnitCalculatorTab;
