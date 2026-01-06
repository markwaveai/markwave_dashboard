import React from 'react';
import BuffaloVisualizerApp from '../buffalo-visualizer/BuffaloVisualizerApp';

const BuffaloVisualizationTab: React.FC = () => {
    return (
        <div style={{ width: '100%', height: 'calc(100vh - 60px)', overflow: 'hidden', position: 'relative' }}>
            <BuffaloVisualizerApp />
        </div>
    );
};

export default BuffaloVisualizationTab;
