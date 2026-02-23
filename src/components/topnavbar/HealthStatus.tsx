import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';


const HealthStatus: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await userService.checkHealth();
        setIsHealthy(response);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm text-gray-500">Checking...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className={`text-sm font-medium ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
        {isHealthy ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

export default HealthStatus;
