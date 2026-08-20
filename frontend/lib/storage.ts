import { Property, Room, Evidence, MaintenanceEvent, DamageAnalysis, ActivityLog } from './types';
import {
  DEMO_PROPERTY,
  DEMO_ROOMS,
  DEMO_EVIDENCE,
  DEMO_MAINTENANCE_EVENTS,
  DEMO_ANALYSES,
  DEMO_ACTIVITIES
} from './demoData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'proofstay_data_v1';

interface AppStore {
  properties: Property[];
  rooms: Room[];
  evidence: Evidence[];
  maintenanceEvents: MaintenanceEvent[];
  analyses: DamageAnalysis[];
  activities: ActivityLog[];
}

const getInitialStore = (): AppStore => {
  if (typeof window === 'undefined') {
    return {
      properties: [DEMO_PROPERTY],
      rooms: DEMO_ROOMS,
      evidence: DEMO_EVIDENCE,
      maintenanceEvents: DEMO_MAINTENANCE_EVENTS,
      analyses: DEMO_ANALYSES,
      activities: DEMO_ACTIVITIES,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading local storage store', err);
  }

  const defaultStore: AppStore = {
    properties: [DEMO_PROPERTY],
    rooms: DEMO_ROOMS,
    evidence: DEMO_EVIDENCE,
    maintenanceEvents: DEMO_MAINTENANCE_EVENTS,
    analyses: DEMO_ANALYSES,
    activities: DEMO_ACTIVITIES,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStore));
  } catch (err) {
    console.error('Error saving initial store', err);
  }

  return defaultStore;
};

const saveStore = (store: AppStore) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (err) {
      console.error('Failed to save store to local storage', err);
    }
  }
};

export async function getProperties(): Promise<Property[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('properties').select('*');
    if (!error && data && data.length > 0) return data as Property[];
  }
  const store = getInitialStore();
  return store.properties;
}

export async function getProperty(id: string): Promise<Property | null> {
  const props = await getProperties();
  return props.find((p) => p.id === id) || props[0] || null;
}

export async function createProperty(propData: Omit<Property, 'id' | 'created_at'>): Promise<Property> {
  const newProp: Property = {
    ...propData,
    id: `prop-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('properties').insert([newProp]);
  }

  const store = getInitialStore();
  store.properties.unshift(newProp);

  // Auto-generate default rooms for new property
  const defaultRoomNames = ['Kitchen', 'Bedroom', 'Living Room', 'Bathroom', 'Balcony', 'Hallway'];
  const defaultRooms: Room[] = defaultRoomNames.map((name, index) => ({
    id: `room-${Date.now()}-${index}`,
    property_id: newProp.id,
    name,
    checklist: ['Walls', 'Flooring', 'Fixtures', 'Windows'],
    created_at: new Date().toISOString(),
  }));

  store.rooms.push(...defaultRooms);

  store.activities.unshift({
    id: `act-${Date.now()}`,
    property_id: newProp.id,
    timestamp: 'Just now',
    title: 'Property Record Created',
    description: `Initial evidence record set up for ${newProp.name}`,
    type: 'move_in',
  });

  saveStore(store);
  return newProp;
}

export async function getRooms(propertyId: string): Promise<Room[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('rooms').select('*').eq('property_id', propertyId);
    if (!error && data && data.length > 0) return data as Room[];
  }
  const store = getInitialStore();
  return store.rooms.filter((r) => r.property_id === propertyId);
}

export async function getEvidence(propertyId: string): Promise<Evidence[]> {
  if (isSupabaseConfigured && supabase) {
    // join through rooms
    const rooms = await getRooms(propertyId);
    const roomIds = rooms.map((r) => r.id);
    if (roomIds.length > 0) {
      const { data, error } = await supabase.from('evidence').select('*').in('room_id', roomIds);
      if (!error && data) return data as Evidence[];
    }
  }
  const store = getInitialStore();
  const rooms = store.rooms.filter((r) => r.property_id === propertyId);
  const roomIds = new Set(rooms.map((r) => r.id));
  return store.evidence.filter((e) => roomIds.has(e.room_id));
}

export async function addEvidence(evidenceData: Omit<Evidence, 'id' | 'created_at'>): Promise<Evidence> {
  const newEv: Evidence = {
    ...evidenceData,
    id: `ev-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('evidence').insert([newEv]);
  }

  const store = getInitialStore();
  store.evidence.push(newEv);
  saveStore(store);
  return newEv;
}

export async function getMaintenanceEvents(propertyId: string): Promise<MaintenanceEvent[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('maintenance_events').select('*').eq('property_id', propertyId);
    if (!error && data && data.length > 0) return data as MaintenanceEvent[];
  }
  const store = getInitialStore();
  return store.maintenanceEvents.filter((m) => m.property_id === propertyId);
}

export async function addMaintenanceEvent(eventData: Omit<MaintenanceEvent, 'id' | 'created_at'>): Promise<MaintenanceEvent> {
  const newEvent: MaintenanceEvent = {
    ...eventData,
    id: `maint-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('maintenance_events').insert([newEvent]);
  }

  const store = getInitialStore();
  store.maintenanceEvents.push(newEvent);

  store.activities.unshift({
    id: `act-${Date.now()}`,
    property_id: eventData.property_id,
    timestamp: 'Just now',
    title: 'Maintenance Event Added',
    description: `${eventData.category.replace('_', ' ')} event reported`,
    type: 'maintenance',
  });

  saveStore(store);
  return newEvent;
}

export async function getAnalyses(propertyId: string): Promise<DamageAnalysis[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('damage_analyses').select('*').eq('property_id', propertyId);
    if (!error && data && data.length > 0) return data as DamageAnalysis[];
  }
  const store = getInitialStore();
  return store.analyses.filter((a) => a.property_id === propertyId);
}

export async function saveAnalysis(analysisData: Omit<DamageAnalysis, 'id' | 'created_at'>): Promise<DamageAnalysis> {
  const newAnalysis: DamageAnalysis = {
    ...analysisData,
    id: `analysis-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('damage_analyses').insert([newAnalysis]);
  }

  const store = getInitialStore();
  store.analyses.unshift(newAnalysis);

  store.activities.unshift({
    id: `act-${Date.now()}`,
    property_id: analysisData.property_id,
    timestamp: 'Just now',
    title: 'AI Analysis Updated',
    description: `Analyzed ${analysisData.issue}`,
    type: 'analysis',
  });

  saveStore(store);
  return newAnalysis;
}

export async function getActivities(propertyId: string): Promise<ActivityLog[]> {
  const store = getInitialStore();
  return store.activities.filter((act) => act.property_id === propertyId);
}

export function resetToDemoData() {
  if (typeof window !== 'undefined') {
    const defaultStore: AppStore = {
      properties: [DEMO_PROPERTY],
      rooms: DEMO_ROOMS,
      evidence: DEMO_EVIDENCE,
      maintenanceEvents: DEMO_MAINTENANCE_EVENTS,
      analyses: DEMO_ANALYSES,
      activities: DEMO_ACTIVITIES,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStore));
  }
}
