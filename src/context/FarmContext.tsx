import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Block {
  block_id: string;
  block_name: string;
  crop?: string;
  area_acres?: number;
  last_mapped?: string;
}

interface FarmContextType {
  blocks: Block[];
  activeBlock: Block | null;
  setActiveBlock: (block: Block | null) => void;
  saveBoundary: (geojson: any) => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const MOCK_BLOCKS: Block[] = [
  { block_id: 'BLK-001', block_name: 'Vineyard East', crop: 'Chardonnay', area_acres: 12.5, last_mapped: '2023-11-12' },
  { block_id: 'BLK-002', block_name: 'Orchard South', crop: 'Almonds', area_acres: 8.2, last_mapped: '2024-01-05' },
  { block_id: 'BLK-003', block_name: 'Greenhouse B-4', crop: 'Tomatoes', area_acres: 1.5, last_mapped: '2024-03-20' },
];

export const FarmProvider = ({ children }: { children: ReactNode }) => {
  const [blocks, setBlocks] = useState<Block[]>(MOCK_BLOCKS);
  const [activeBlock, setActiveBlock] = useState<Block | null>(MOCK_BLOCKS[0]);

  const saveBoundary = async (geojson: any) => {
    // In a real app, this would be an API call
    console.log('Saving farm boundary:', geojson);
    
    // Update the last_mapped date for the active block
    if (activeBlock) {
      const updatedBlocks = blocks.map(b => 
        b.block_id === activeBlock.block_id 
          ? { ...b, last_mapped: new Date().toISOString().split('T')[0] } 
          : b
      );
      setBlocks(updatedBlocks);
    }
    
    return Promise.resolve();
  };

  return (
    <FarmContext.Provider value={{ blocks, activeBlock, setActiveBlock, saveBoundary }}>
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
