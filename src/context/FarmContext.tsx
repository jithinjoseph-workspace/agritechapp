import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../api/authService';

interface SensorReading {
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

interface Block {
  block_id: string;
  lanslu: string;
  crop: string;
  description: string;
  area_ha: number;
  timezone: string;
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
}

const FarmContext = createContext<FarmContextType>({
  farmData: null,
  activeBlock: null,
  isLoading: false,
  refreshFarmData: async () => {},
  refreshActiveBlockSensors: async () => {},
  setActiveBlockById: () => {},
});

export const FarmProvider = ({ children }: { children: React.ReactNode }) => {
  const [farmData, setFarmData] = useState<FarmDetails | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshFarmData = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const data = await authService.getUserDetails(userId);
      setFarmData(data);
      
      // Default to the first block if none is selected
      if (data.blocks && data.blocks.length > 0 && !activeBlockId) {
        setActiveBlockId(data.blocks[0].block_id);
      }
    } catch (error) {
      console.error('Failed to fetch farm data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeBlockId]);

  const refreshActiveBlockSensors = useCallback(async (blockId: string) => {
    try {
      const latestData = await authService.getLatestSnapshot(blockId);
      
      setFarmData(prev => {
        if (!prev) return prev;

        const updatedBlocks = prev.blocks.map(block => {
          if (block.block_id !== blockId) return block;

          console.log(`🔄 [Context] Updating sensors for block: ${block.lanslu}`);

          const updatedSensors = Array.isArray(latestData?.sensors)
            ? latestData.sensors
            : block.sensors.sensors;

          updatedSensors.forEach((sensor: any) => {
            console.log(`   📍 ${sensor.sensor_type}: ${sensor.value}`);
          });

          return {
            ...block,
            sensors: {
              ...block.sensors,
              block_id: latestData?.block_id ?? block.sensors.block_id,
              block_name: latestData?.block_name ?? block.sensors.block_name,
              generated_at: latestData?.generated_at ?? new Date().toISOString(),
              sensors: updatedSensors,
            }
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

  const activeBlock = farmData?.blocks.find(b => b.block_id === activeBlockId) || farmData?.blocks[0] || null;

  return (
    <FarmContext.Provider value={{ 
      farmData, 
      activeBlock, 
      isLoading, 
      refreshFarmData, 
      refreshActiveBlockSensors,
      setActiveBlockById 
    }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => useContext(FarmContext);
