import { Property, Room, Evidence, MaintenanceEvent, DamageAnalysis, ActivityLog } from './types';

export const DEMO_PROPERTY: Property = {
  id: 'prop-greenwood-204',
  user_id: 'user-demo-01',
  name: 'Greenwood Apartment 204',
  address: '742 Evergreen Terrace, Apt 204, Springfield',
  landlord_name: 'Apex Property Management',
  move_in_date: '2026-01-15',
  move_out_date: '2026-12-31',
  created_at: '2026-01-15T09:00:00Z',
};

export const DEMO_ROOMS: Room[] = [
  { id: 'room-kitchen', property_id: 'prop-greenwood-204', name: 'Kitchen', checklist: ['Walls', 'Flooring', 'Cabinets', 'Sink', 'Windows', 'Appliances'], created_at: '2026-01-15T09:05:00Z' },
  { id: 'room-bedroom', property_id: 'prop-greenwood-204', name: 'Bedroom', checklist: ['Walls', 'Flooring', 'Doors', 'Windows', 'Light Fixtures'], created_at: '2026-01-15T09:05:00Z' },
  { id: 'room-living', property_id: 'prop-greenwood-204', name: 'Living Room', checklist: ['Walls', 'Flooring', 'Baseboards', 'Windows'], created_at: '2026-01-15T09:05:00Z' },
  { id: 'room-bathroom', property_id: 'prop-greenwood-204', name: 'Bathroom', checklist: ['Sink', 'Toilet', 'Shower/Tub', 'Tiles', 'Ventilation'], created_at: '2026-01-15T09:05:00Z' },
  { id: 'room-balcony', property_id: 'prop-greenwood-204', name: 'Balcony', checklist: ['Railing', 'Flooring', 'Sliding Glass Door'], created_at: '2026-01-15T09:05:00Z' },
  { id: 'room-hallway', property_id: 'prop-greenwood-204', name: 'Hallway', checklist: ['Walls', 'Flooring', 'Smoke Detector'], created_at: '2026-01-15T09:05:00Z' },
];

export const DEMO_EVIDENCE: Evidence[] = [
  // Scenario 1: Kitchen Crack (Pre-existing)
  {
    id: 'ev-in-kitchen-01',
    room_id: 'room-kitchen',
    type: 'move_in',
    file_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    captured_at: '2026-01-15T10:15:00Z',
    description: 'Move-in photo of kitchen plaster near window showing minor hairline hairline crack.',
    condition_tags: ['minor_crack'],
    ai_analysis: {
      room: 'Kitchen',
      objects: [
        { object: 'wall', condition: 'hairline crack', severity: 'low', location: 'beside window frame' }
      ],
      summary: 'Hairline hairline crack observed near top right corner of kitchen window.'
    },
    created_at: '2026-01-15T10:15:00Z',
  },
  {
    id: 'ev-out-kitchen-01',
    room_id: 'room-kitchen',
    type: 'move_out',
    file_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    captured_at: '2026-12-28T14:30:00Z',
    description: 'Move-out photo of kitchen plaster near window.',
    condition_tags: ['minor_crack'],
    ai_analysis: {
      room: 'Kitchen',
      objects: [
        { object: 'wall', condition: 'hairline crack', severity: 'low', location: 'beside window frame' }
      ],
      summary: 'Hairline crack in identical location with negligible change in extent.'
    },
    created_at: '2026-12-28T14:30:00Z',
  },

  // Scenario 2: Kitchen Wall Stain (Maintenance-related)
  {
    id: 'ev-in-kitchen-wall',
    room_id: 'room-kitchen',
    type: 'move_in',
    file_url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    captured_at: '2026-01-15T10:18:00Z',
    description: 'Clean kitchen ceiling and upper wall surface near piping enclosure.',
    condition_tags: ['clean'],
    ai_analysis: {
      room: 'Kitchen',
      objects: [
        { object: 'wall', condition: 'clean', severity: 'low', location: 'upper ceiling junction' }
      ],
      summary: 'Clean painted plaster surface without water marks or discoloration.'
    },
    created_at: '2026-01-15T10:18:00Z',
  },
  {
    id: 'ev-maint-leak-01',
    room_id: 'room-kitchen',
    type: 'maintenance',
    file_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    captured_at: '2026-10-12T08:45:00Z',
    description: 'Active water drip from upper ceiling pipe joint into kitchen.',
    condition_tags: ['water_mark'],
    ai_analysis: {
      room: 'Kitchen',
      objects: [
        { object: 'ceiling', condition: 'active moisture leak', severity: 'high', location: 'pipe joint near ceiling' }
      ],
      summary: 'Water accumulation dripping down wall surface.'
    },
    created_at: '2026-10-12T08:45:00Z',
  },
  {
    id: 'ev-out-kitchen-wall',
    room_id: 'room-kitchen',
    type: 'move_out',
    file_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    captured_at: '2026-12-28T14:35:00Z',
    description: 'Yellowish water stain ring on kitchen ceiling near former leak site.',
    condition_tags: ['stain', 'water_mark'],
    ai_analysis: {
      room: 'Kitchen',
      objects: [
        { object: 'ceiling wall', condition: 'water stain ring', severity: 'medium', location: 'upper corner near pipe' }
      ],
      summary: 'Visible discolored water stain boundary.'
    },
    created_at: '2026-12-28T14:35:00Z',
  },

  // Scenario 3: Bedroom Wall Scratch (New / Unexplained)
  {
    id: 'ev-in-bed-01',
    room_id: 'room-bedroom',
    type: 'move_in',
    file_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    captured_at: '2026-01-15T10:40:00Z',
    description: 'Move-in photo of main bedroom wall behind door position.',
    condition_tags: ['clean'],
    ai_analysis: {
      room: 'Bedroom',
      objects: [
        { object: 'wall', condition: 'clean', severity: 'low', location: 'behind entrance door' }
      ],
      summary: 'Smooth painted drywall with no scratches.'
    },
    created_at: '2026-01-15T10:40:00Z',
  },
  {
    id: 'ev-out-bed-01',
    room_id: 'room-bedroom',
    type: 'move_out',
    file_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    captured_at: '2026-12-28T15:10:00Z',
    description: 'Move-out photo showing 15cm linear surface scratch on bedroom wall.',
    condition_tags: ['scratch'],
    ai_analysis: {
      room: 'Bedroom',
      objects: [
        { object: 'wall', condition: 'surface abrasion scratch', severity: 'medium', location: 'behind entrance door' }
      ],
      summary: 'New 15cm linear scratch through surface paint layer.'
    },
    created_at: '2026-12-28T15:10:00Z',
  },
];

export const DEMO_MAINTENANCE_EVENTS: MaintenanceEvent[] = [
  {
    id: 'maint-001',
    property_id: 'prop-greenwood-204',
    room_id: 'room-kitchen',
    date: '2026-10-12',
    category: 'water_leakage',
    description: 'Water leaking from ceiling near kitchen window pipe riser during heavy upper-floor drainage.',
    status: 'resolved',
    attachments: ['ev-maint-leak-01'],
    created_at: '2026-10-12T09:00:00Z',
  },
  {
    id: 'maint-002',
    property_id: 'prop-greenwood-204',
    room_id: 'room-kitchen',
    date: '2026-10-14',
    category: 'plumbing',
    description: 'Plumbing contractor replaced leaking pipe joint inside ceiling stack. Ceiling drywall left to dry.',
    status: 'resolved',
    attachments: [],
    created_at: '2026-10-14T16:00:00Z',
  },
  {
    id: 'maint-003',
    property_id: 'prop-greenwood-204',
    room_id: 'room-bathroom',
    date: '2026-06-04',
    category: 'plumbing',
    description: 'Slow drain in bathroom sink reported and cleared with auger.',
    status: 'resolved',
    attachments: [],
    created_at: '2026-06-04T11:20:00Z',
  },
];

export const DEMO_ANALYSES: DamageAnalysis[] = [
  {
    id: 'analysis-001',
    property_id: 'prop-greenwood-204',
    room_id: 'room-kitchen',
    issue: 'Kitchen Plaster Hairline Crack',
    change_detected: 'minor_change',
    classification: 'pre_existing',
    confidence: 'high',
    evidence_strength: 'strong',
    reasoning: [
      'Move-in photo (Jan 15, 2026) clearly shows hairline crack beside kitchen window frame.',
      'Move-out photo (Dec 28, 2026) confirms crack remains identical in dimensions and severity.',
      'No structural maintenance events affected this wall section.',
      'Evidence strongly supports pre-existing condition with zero newly induced damage.'
    ],
    evidence_ids: ['ev-in-kitchen-01', 'ev-out-kitchen-01'],
    move_in_photo_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    move_out_photo_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-12-28T16:00:00Z',
  },
  {
    id: 'analysis-002',
    property_id: 'prop-greenwood-204',
    room_id: 'room-kitchen',
    issue: 'Kitchen Ceiling Water Discoloration Ring',
    change_detected: 'significant_change',
    classification: 'maintenance_related',
    confidence: 'high',
    evidence_strength: 'strong',
    reasoning: [
      'Move-in photo (Jan 15, 2026) shows clean ceiling plaster with zero discoloration.',
      'Maintenance log records water leakage incident on Oct 12, 2026 in kitchen ceiling area.',
      'Plumbing repair logged on Oct 14, 2026 notes ceiling drywall drying without repainting.',
      'Move-out photo (Dec 28, 2026) shows yellow water ring at exact leakage location.',
      'Timeline and visual evidence establish temporal connection to documented building maintenance event.'
    ],
    evidence_ids: ['ev-in-kitchen-wall', 'ev-maint-leak-01', 'maint-001', 'maint-002', 'ev-out-kitchen-wall'],
    move_in_photo_url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
    move_out_photo_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-12-28T16:00:00Z',
  },
  {
    id: 'analysis-003',
    property_id: 'prop-greenwood-204',
    room_id: 'room-bedroom',
    issue: 'Bedroom Drywall Surface Scratch',
    change_detected: 'significant_change',
    classification: 'new_unexplained',
    confidence: 'medium',
    evidence_strength: 'moderate',
    reasoning: [
      'Move-in photo (Jan 15, 2026) displays clean painted drywall behind bedroom door.',
      'Move-out photo (Dec 28, 2026) shows newly appeared 15cm linear abrasion.',
      'No maintenance records or external structural incidents correspond to this location.',
      'Insufficient evidence to establish root cause. Further human review recommended.'
    ],
    evidence_ids: ['ev-in-bed-01', 'ev-out-bed-01'],
    move_in_photo_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    move_out_photo_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-12-28T16:00:00Z',
  },
];

export const DEMO_ACTIVITIES: ActivityLog[] = [
  { id: 'act-1', property_id: 'prop-greenwood-204', timestamp: 'Today', title: 'Move-Out Documentation Complete', description: 'Captured final room evidence photos and notes.', type: 'move_out' },
  { id: 'act-2', property_id: 'prop-greenwood-204', timestamp: 'Today', title: 'AI Evidence Analysis Run', description: 'Temporal reasoning engine evaluated 3 room change points.', type: 'analysis' },
  { id: 'act-3', property_id: 'prop-greenwood-204', timestamp: 'Oct 14', title: 'Plumbing Repair Completed', description: 'Contractor resolved ceiling pipe riser leak.', type: 'maintenance' },
  { id: 'act-4', property_id: 'prop-greenwood-204', timestamp: 'Oct 12', title: 'Water Leakage Event Added', description: 'Logged active water leak in kitchen ceiling.', type: 'maintenance' },
  { id: 'act-5', property_id: 'prop-greenwood-204', timestamp: 'Jan 15', title: 'Move-In Evidence Uploaded', description: 'Documented 6 rooms with baseline photographs.', type: 'move_in' },
];
