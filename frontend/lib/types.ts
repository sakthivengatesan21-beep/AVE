export type EvidenceType = 'move_in' | 'move_out' | 'maintenance';

export type ConditionTag = 'clean' | 'minor_crack' | 'stain' | 'scratch' | 'dent' | 'water_mark' | 'peeling_paint' | 'other';

export type AttributionCategory =
  | 'pre_existing'
  | 'maintenance_related'
  | 'normal_wear'
  | 'new_unexplained'
  | 'potentially_tenant'
  | 'inconclusive';

export type ChangeDetection = 'unchanged' | 'minor_change' | 'significant_change' | 'unclear';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type EvidenceStrength = 'strong' | 'moderate' | 'weak' | 'insufficient';

export interface Property {
  id: string;
  user_id: string;
  name: string;
  address: string;
  landlord_name: string;
  move_in_date: string;
  move_out_date: string;
  created_at: string;
}

export interface Room {
  id: string;
  property_id: string;
  name: string;
  checklist: string[];
  created_at: string;
}

export interface AIObjectDetection {
  object: string;
  condition: string;
  severity: 'low' | 'medium' | 'high';
  location: string;
}

export interface VisualAnalysis {
  room: string;
  objects: AIObjectDetection[];
  summary: string;
}

export interface Evidence {
  id: string;
  room_id: string;
  type: EvidenceType;
  file_url: string;
  captured_at: string;
  description: string;
  condition_tags?: ConditionTag[];
  ai_analysis?: VisualAnalysis;
  created_at: string;
}

export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'structural'
  | 'appliance'
  | 'water_leakage'
  | 'heating_cooling'
  | 'other';

export interface MaintenanceEvent {
  id: string;
  property_id: string;
  room_id: string;
  date: string;
  category: MaintenanceCategory;
  description: string;
  status: 'reported' | 'in_progress' | 'resolved';
  attachments: string[]; // image/doc URLs
  created_at: string;
}

export interface DamageAnalysis {
  id: string;
  property_id: string;
  room_id: string;
  issue: string;
  change_detected: ChangeDetection;
  classification: AttributionCategory;
  confidence: ConfidenceLevel;
  evidence_strength: EvidenceStrength;
  reasoning: string[];
  evidence_ids: string[];
  move_in_photo_url?: string;
  move_out_photo_url?: string;
  created_at: string;
}

export interface Report {
  id: string;
  property_id: string;
  generated_at: string;
  summary: {
    rooms_documented: number;
    photos_collected: number;
    maintenance_events: number;
    issues_detected: number;
  };
  report_url?: string;
}

export interface ActivityLog {
  id: string;
  property_id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'move_in' | 'move_out' | 'maintenance' | 'analysis';
}
