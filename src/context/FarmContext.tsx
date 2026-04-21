import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../api/authService';
import { useAuth } from './AuthContext';

export interface SensorReading {
  sensor_id: string;
  sensor_type: string;
  label: string;
  unit: string;
  value: number;
  status: string;
  observed_at: string;
  threshold_low?: number;
  threshold_high?: number;
  histories?: {
    hourly: any[];
    daily: any[];
    weekly: any[];
  };
}

export interface Block {
  block_id: string;
  lanslu: string;
  crop: string;
  description: string;
  area_ha: number;
  timezone: string;
  last_mapped?: string;
  sensors: {
    block_id: string;
    block_name: string;
    generated_at: string;
    sensors: SensorReading[];
  };
}

interface FarmDetails {
  user_id: string;
  name: string;
  email: string;
  role: string;
  farm_name: string;
  farm_location: string;
  blocks: Block[];
}

interface FarmContextType {
  farmData: FarmDetails | null;
  activeBlock: Block | null;
  isLoading: boolean;
  refreshFarmData: (userId: string) => Promise<void>;
  refreshActiveBlockSensors: (blockId: string) => Promise<void>;
  setActiveBlockById: (id: string) => void;
  clearFarmData: () => void;
  saveBoundary: (geojson: any) => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [farmData, setFarmData] = useState<FarmDetails | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearFarmData = useCallback(() => {
    setFarmData(null);
    setActiveBlockId(null);
    setIsLoading(false);
  }, []);

  const refreshFarmData = useCallback(
    async (userId: string) => {
      if (farmData?.user_id !== userId) {
        setFarmData(null);
        setActiveBlockId(null);
      }

      setIsLoading(true);
      try {
        const data: FarmDetails = await authService.getUserDetails(userId);
        setFarmData(data);

        setActiveBlockId(previousBlockId => {
          if (!data.blocks?.length) {
            return null;
          }

          const stillValidSelection = previousBlockId
            ? data.blocks.some(block => block.block_id === previousBlockId)
            : false;

          return stillValidSelection ? previousBlockId : data.blocks[0].block_id;
        });
      } catch (error) {
        console.error('Failed to fetch farm data:', error);
        setFarmData(null);
        setActiveBlockId(null);
      } finally {
        setIsLoading(false);
      }
    },
    [farmData?.user_id],
  );

  useEffect(() => {
    const currentUserId = user?.user_id || user?.id || null;
    if (isAuthenticated && currentUserId) {
      return;
    }

    clearFarmData();
  }, [clearFarmData, isAuthenticated, user?.id, user?.user_id]);

  const refreshActiveBlockSensors = useCallback(async (blockId: string) => {
    try {
      const latestData = await authService.getLatestSnapshot(blockId);

      setFarmData(prev => {
        if (!prev) {
          return prev;
        }

        const updatedBlocks = prev.blocks.map(block => {
          if (block.block_id !== blockId) {
            return block;
          }

          const updatedSensors = Array.isArray(latestData?.sensors) ? latestData.sensors : block.sensors.sensors;

          return {
            ...block,
            sensors: {
              ...block.sensors,
              block_id: latestData?.block_id ?? block.sensors.block_id,
              block_name: latestData?.block_name ?? block.sensors.block_name,
              generated_at: latestData?.generated_at ?? new Date().toISOString(),
              sensors: updatedSensors,
            },
          };
        });

        return { ...prev, blocks: updatedBlocks };
      });
    } catch (error) {
      console.error('Failed to refresh sensors:', error);
    }
  }, []);

  const setActiveBlockById = (id: string) => {
    setActiveBlockId(id);
  };

  const saveBoundary = async (geojson: any) => {
    // Re-implemented from local HEAD branch for MappingScreen support
    console.log('Saving farm boundary:', geojson);
    
    if (activeBlockId && farmData) {
      const updatedBlocks = farmData.blocks.map(b => 
        b.block_id === activeBlockId 
          ? { ...b, last_mapped: new Date().toISOString().split('T')[0] } 
          : b
      );
      setFarmData({ ...farmData, blocks: updatedBlocks });
    }
    
    return Promise.resolve();
  };

  const activeBlock = farmData?.blocks.find(block => block.block_id === activeBlockId) || farmData?.blocks[0] || null;

  return (
    <FarmContext.Provider
      value={{
        farmData,
        activeBlock,
        isLoading,
        refreshFarmData,
        refreshActiveBlockSensors,
        setActiveBlockById,
        clearFarmData,
        saveBoundary,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
