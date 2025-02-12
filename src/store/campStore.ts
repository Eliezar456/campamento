import { create } from 'zustand';
import { Leader, Camper } from '../types';

interface CampState {
  totalSpots: number;
  leaders: Leader[];
  campers: Camper[];
  setTotalSpots: (spots: number) => void;
  setLeaders: (leaders: Leader[]) => void;
  addLeader: (leader: Leader) => void;
  updateLeader: (oldName: string, leader: Leader) => void;
  deleteLeader: (name: string) => void;
  addCamper: (camper: Omit<Camper, 'id' | 'sequentialNumber'>) => void;
  updateCamper: (id: number, camper: Partial<Camper>) => void;
  deleteCamper: (id: number) => void;
  bulkDeleteCampers: (by?: 'leader' | 'institution', value?: string) => void;
  updateLeaderSpots: () => void;
}

export const useCampStore = create<CampState>((set, get) => ({
  totalSpots: 200,
  leaders: [
    { name: "Juan Pérez", assignedSpots: 20, usedSpots: 0 },
    { name: "María García", assignedSpots: 30, usedSpots: 0 },
    { name: "Carlos López", assignedSpots: 25, usedSpots: 0 }
  ],
  campers: [
    { id: 1, fullName: "Ana Martínez", institution: "Iglesia Central", leader: "Juan Pérez", sequentialNumber: 1 },
    { id: 2, fullName: "Pedro Sánchez", institution: "Iglesia Norte", leader: "María García", sequentialNumber: 2 },
    { id: 3, fullName: "Luis Torres", institution: "Iglesia Sur", leader: "Carlos López", sequentialNumber: 3 }
  ],
  setTotalSpots: (spots) => set({ totalSpots: spots }),
  setLeaders: (leaders) => {
    set({ leaders });
    get().updateLeaderSpots();
  },
  addLeader: (leader) => {
    set((state) => ({ 
      leaders: [...state.leaders, { ...leader, usedSpots: 0 }] 
    }));
    get().updateLeaderSpots();
  },
  updateLeader: (oldName, leader) => {
    set((state) => ({
      leaders: state.leaders.map(l => l.name === oldName ? { ...leader, usedSpots: 0 } : l),
      campers: state.campers.map(c => c.leader === oldName ? { ...c, leader: leader.name } : c)
    }));
    get().updateLeaderSpots();
  },
  deleteLeader: (name) => {
    set((state) => ({
      leaders: state.leaders.filter(l => l.name !== name)
    }));
    get().updateLeaderSpots();
  },
  addCamper: (camper) => {
    set((state) => {
      const newId = Math.max(0, ...state.campers.map(c => c.id)) + 1;
      const newSequentialNumber = Math.max(0, ...state.campers.map(c => c.sequentialNumber)) + 1;
      const newCamper = { 
        ...camper, 
        id: newId, 
        sequentialNumber: newSequentialNumber 
      };
      
      return {
        campers: [...state.campers, newCamper],
      };
    });
    get().updateLeaderSpots();
  },
  updateCamper: (id, updates) => {
    set((state) => ({
      campers: state.campers.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
    get().updateLeaderSpots();
  },
  deleteCamper: (id) => {
    set((state) => ({
      campers: state.campers.filter(c => c.id !== id),
    }));
    get().updateLeaderSpots();
  },
  bulkDeleteCampers: (by?: 'leader' | 'institution', value?: string) => {
    set((state) => {
      if (!by) {
        return { campers: [] };
      }

      return {
        campers: state.campers.filter(camper => 
          by === 'leader' 
            ? camper.leader !== value
            : camper.institution !== value
        )
      };
    });
    get().updateLeaderSpots();
  },
  updateLeaderSpots: () => {
    set((state) => {
      // Count campers per leader
      const camperCounts = state.campers.reduce((counts: {[key: string]: number}, camper) => {
        counts[camper.leader] = (counts[camper.leader] || 0) + 1;
        return counts;
      }, {});

      // Update leader usedSpots based on actual camper count
      const updatedLeaders = state.leaders.map(leader => ({
        ...leader,
        usedSpots: camperCounts[leader.name] || 0
      }));

      return { leaders: updatedLeaders };
    });
  }
}));