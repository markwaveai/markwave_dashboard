import React, { useEffect } from 'react';
import UnitCalculatorApp from './UnitCalculatorApp';

interface UnitCalculatorTabProps {
    tree?: boolean;
}

const UnitCalculatorTab: React.FC<UnitCalculatorTabProps> = ({ tree = true }) => {
    // Save the current selection to session storage to enable "smart" redirects
    useEffect(() => {
        const mode = tree ? '73d2a' : '92f1b';
        sessionStorage.setItem('lastUnitCalcMode', mode);
    }, [tree]);

    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
            <UnitCalculatorApp key={tree ? 'with-tree' : 'without-tree'} tree={tree} />
        </div>
    );
};

export default UnitCalculatorTab;
