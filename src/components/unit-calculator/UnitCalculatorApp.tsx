import React from 'react';
import './App.css';
import BuffaloFamilyTree from './components/BuffaloFamilyTree';

export const UnitCalculatorApp: React.FC = () => {
    return (
        <div className="App unit-calculator-root">
            <BuffaloFamilyTree />
        </div>
    );
};

export default UnitCalculatorApp;
