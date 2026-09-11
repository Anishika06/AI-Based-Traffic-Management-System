import fs from 'fs';
import path from 'path';

export interface Vehicle {
  registration_number: string; // Normalized: e.g. "TN01AB1234"
  formatted_number: string;   // e.g. "TN 01 AB 1234"
  owner_name: string;
  father_name: string;
  rto_code: string;
  rto_office: string;
  state: string;
  maker: string;
  model: string;
  vehicle_class: string;
  body_type: string;
  fuel_type: string;
  emission_norms: string;
  color: string;
  engine_number: string;
  chassis_number: string;
  registration_date: string;
  vehicle_age: string;
  fitness_upto: string;
  rc_status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  insurance_company: string;
  insurance_policy: string;
  insurance_expiry: string;
  insurance_status: 'ACTIVE' | 'EXPIRED';
  puc_number: string;
  puc_expiry: string;
  puc_status: 'ACTIVE' | 'EXPIRED';
  tax_status: string;
  hypothecation: string;
  blacklist_status: 'CLEAN' | 'ALERT';
}

export interface Challan {
  id: string;
  vehicle_number: string;
  violation: string;
  section: string;
  date: string;
  time: string;
  location: string;
  fine: number;
  status: 'Unpaid' | 'Paid' | 'Disputed';
  detection_source: string;
  image_url?: string;
  payment_date?: string;
  payment_transaction_id?: string;
  receipt_number?: string;
}

export interface CitizenReport {
  id: number;
  name: string;
  location: string;
  issue_type: string;
  description: string;
  date_time: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  image_url?: string;
  assigned_officer?: string;
  resolution_notes?: string;
}

export interface EmergencyRequest {
  id: string;
  name: string;
  vehicle_number: string;
  emergency_type: 'Ambulance Passage' | 'Severe Accident' | 'Fire Incident' | 'Breakdown in Express Lane' | 'Medical Urgent';
  location: string;
  description: string;
  reported_at: string;
  status: 'Alert Received' | 'Ambulance Dispatched' | 'Green Corridor Active' | 'Resolved';
  assigned_unit?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface TrafficSignal {
  id: string;
  junction_name: string;
  location: string;
  current_phase: 'NORTH_SOUTH_GREEN' | 'EAST_WEST_GREEN' | 'ALL_RED' | 'EMERGENCY_AMBULANCE_OVERRIDE';
  green_duration_seconds: number;
  red_duration_seconds: number;
  mode: 'AI Dynamic Adaptive' | 'Emergency Green Wave' | 'Fixed Timing';
  congestion_level: 'Low' | 'Moderate' | 'Heavy' | 'Gridlock';
  congestion_percentage: number;
  ambulance_detected: boolean;
  active_vehicles_count: number;
  last_updated: string;
}

export interface TrafficAlert {
  id: string;
  title: string;
  type: 'Warning' | 'Diversion' | 'Road Work' | 'Congestion' | 'Emergency Clearance';
  location: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  issued_at: string;
  valid_till: string;
  active: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJson<T>(filename: string, fallback: T): T {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
  }
  saveJson(filename, fallback);
  return fallback;
}

function saveJson<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
}

// -------------------------------------------------------------
// RTO & STATE REGISTRY MAPPER
// -------------------------------------------------------------
export const STATE_NAMES: Record<string, string> = {
  TN: 'Tamil Nadu',
  MH: 'Maharashtra',
  DL: 'Delhi',
  KA: 'Karnataka',
  UP: 'Uttar Pradesh',
  HR: 'Haryana',
  TS: 'Telangana',
  AP: 'Andhra Pradesh',
  GJ: 'Gujarat',
  RJ: 'Rajasthan',
  KL: 'Kerala',
  WB: 'West Bengal',
  PB: 'Punjab',
  MP: 'Madhya Pradesh',
  CH: 'Chandigarh',
  BR: 'Bihar',
  OD: 'Odisha',
  JH: 'Jharkhand',
  AS: 'Assam',
  UK: 'Uttarakhand',
  HP: 'Himachal Pradesh',
  GA: 'Goa',
  JK: 'Jammu & Kashmir',
  PY: 'Puducherry'
};

export const RTO_OFFICES: Record<string, string> = {
  TN01: 'TN-01 Chennai Central RTO (Ayanavaram), Tamil Nadu',
  TN02: 'TN-02 Chennai North-West RTO (Anna Nagar), Tamil Nadu',
  TN03: 'TN-03 Chennai North-East RTO (Tondiarpet), Tamil Nadu',
  TN04: 'TN-04 Chennai East RTO (Pulianthope), Tamil Nadu',
  TN05: 'TN-05 Chennai North RTO (Kolathur), Tamil Nadu',
  TN06: 'TN-06 Chennai South-East RTO (Mandaveli), Tamil Nadu',
  TN07: 'TN-07 Chennai South RTO (Thiruvanmiyur), Tamil Nadu',
  TN09: 'TN-09 Chennai West RTO (K.K. Nagar), Tamil Nadu',
  TN10: 'TN-10 Chennai South-West RTO (Virugambakkam), Tamil Nadu',
  TN22: 'TN-22 Meenambakkam RTO, Chennai, Tamil Nadu',
  TN37: 'TN-37 Coimbatore South RTO, Tamil Nadu',
  TN38: 'TN-38 Coimbatore North RTO, Tamil Nadu',
  TN58: 'TN-58 Madurai South RTO, Tamil Nadu',
  TN69: 'TN-69 Thoothukudi RTO, Tamil Nadu',

  MH01: 'MH-01 Mumbai Central (Tardeo) RTO, Maharashtra',
  MH02: 'MH-02 Mumbai West (Andheri) RTO, Maharashtra',
  MH03: 'MH-03 Mumbai East (Wadala) RTO, Maharashtra',
  MH04: 'MH-04 Thane RTO, Maharashtra',
  MH05: 'MH-05 Kalyan RTO, Maharashtra',
  MH12: 'MH-12 Pune RTO, Maharashtra',
  MH14: 'MH-14 Pimpri-Chinchwad RTO, Maharashtra',
  MH20: 'MH-20 Chhatrapati Sambhajinagar (Aurangabad) RTO, Maharashtra',
  MH31: 'MH-31 Nagpur Urban RTO, Maharashtra',
  MH43: 'MH-43 Navi Mumbai (Vashi) RTO, Maharashtra',

  DL01: 'DL-01 Mall Road (North Delhi) RTO, Delhi',
  DL02: 'DL-02 Tilak Marg (New Delhi) RTO, Delhi',
  DL03: 'DL-03 Sheikh Sarai (South Delhi) RTO, Delhi',
  DL04: 'DL-04 Janakpuri (West Delhi) RTO, Delhi',
  DL05: 'DL-05 Loni Road (North East Delhi) RTO, Delhi',
  DL06: 'DL-06 Sarai Kale Khan (Central Delhi) RTO, Delhi',
  DL07: 'DL-07 Mayur Vihar (East Delhi) RTO, Delhi',
  DL08: 'DL-08 Wazirpur (North West Delhi) RTO, Delhi',
  DL09: 'DL-09 Palam / Dwarka (South West Delhi) RTO, Delhi',
  DL10: 'DL-10 Raja Garden (West Delhi II) RTO, Delhi',
  DL11: 'DL-11 Rohini (North West Delhi II) RTO, Delhi',
  DL12: 'DL-12 Vasant Vihar (South West Delhi II) RTO, Delhi',

  KA01: 'KA-01 Bangalore Central (Koramangala) RTO, Karnataka',
  KA02: 'KA-02 Bangalore West (Rajajinagar) RTO, Karnataka',
  KA03: 'KA-03 Bangalore East (Indiranagar) RTO, Karnataka',
  KA04: 'KA-04 Bangalore North (Yeshwanthpur) RTO, Karnataka',
  KA05: 'KA-05 Bangalore South (Jayanagar) RTO, Karnataka',
  KA51: 'KA-51 Electronic City RTO, Bengaluru, Karnataka',
  KA53: 'KA-53 Krishnarajapuram (KR Puram) RTO, Bengaluru, Karnataka',
  KA09: 'KA-09 Mysore Urban RTO, Karnataka',
  KA19: 'KA-19 Mangalore RTO, Karnataka',

  UP16: 'UP-16 Noida (Gautam Buddha Nagar) RTO, Uttar Pradesh',
  UP14: 'UP-14 Ghaziabad RTO, Uttar Pradesh',
  UP32: 'UP-32 Lucknow RTO, Uttar Pradesh',
  UP78: 'UP-78 Kanpur Nagar RTO, Uttar Pradesh',
  UP70: 'UP-70 Prayagraj RTO, Uttar Pradesh',
  UP80: 'UP-80 Agra RTO, Uttar Pradesh',
  UP65: 'UP-65 Varanasi RTO, Uttar Pradesh',

  HR26: 'HR-26 Gurugram North RTO, Haryana',
  HR55: 'HR-55 Gurugram South RTO, Haryana',
  HR51: 'HR-51 Faridabad RTO, Haryana',
  HR03: 'HR-03 Panchkula RTO, Haryana',

  TS09: 'TS-09 Central Hyderabad (Khairatabad) RTO, Telangana',
  TS07: 'TS-07 Secunderabad RTO, Telangana',
  TS08: 'TS-08 Uppal RTO, Hyderabad, Telangana',
  TS10: 'TS-10 Mehdipatnam RTO, Hyderabad, Telangana',
  TS11: 'TS-11 Malakpet RTO, Hyderabad, Telangana',

  GJ01: 'GJ-01 Ahmedabad West RTO, Gujarat',
  GJ27: 'GJ-27 Ahmedabad East RTO, Gujarat',
  GJ05: 'GJ-05 Surat RTO, Gujarat',
  GJ06: 'GJ-06 Vadodara RTO, Gujarat',

  RJ14: 'RJ-14 Jaipur South RTO, Rajasthan',
  RJ45: 'RJ-45 Jaipur North RTO, Rajasthan',
  RJ19: 'RJ-19 Jodhpur RTO, Rajasthan',

  KL01: 'KL-01 Thiruvananthapuram RTO, Kerala',
  KL07: 'KL-07 Ernakulam / Kochi RTO, Kerala',
  KL11: 'KL-11 Kozhikode RTO, Kerala',

  WB01: 'WB-01 Kolkata Central RTO, West Bengal',
  WB02: 'WB-02 Kolkata North (Beltala) RTO, West Bengal',
  WB20: 'WB-20 Kolkata South (Alipore) RTO, West Bengal',

  PB65: 'PB-65 SAS Nagar (Mohali) RTO, Punjab',
  PB10: 'PB-10 Ludhiana RTO, Punjab'
};

// -------------------------------------------------------------
// SEED VEHICLES
// -------------------------------------------------------------
const INITIAL_VEHICLES: Record<string, Vehicle> = {
  TN01AB1234: {
    registration_number: 'TN01AB1234',
    formatted_number: 'TN 01 AB 1234',
    owner_name: 'Dr. Ramesh Sundaram',
    father_name: 'K. Sundaram',
    rto_code: 'TN01',
    rto_office: 'TN-01 Chennai Central RTO (Ayanavaram), Tamil Nadu',
    state: 'Tamil Nadu',
    maker: 'Hyundai Motor India Ltd',
    model: 'Creta SX(O) 1.5 Diesel Automatic',
    vehicle_class: 'Motor Car (LMV - Private)',
    body_type: 'SUV / Compact Crossover',
    fuel_type: 'Diesel',
    emission_norms: 'BS-VI Phase 2',
    color: 'Titan Grey Metallic',
    engine_number: 'D4FA*4892109',
    chassis_number: 'MALC181CL*M048291',
    registration_date: '14-May-2022',
    vehicle_age: '4 Years, 4 Months',
    fitness_upto: '13-May-2037',
    rc_status: 'ACTIVE',
    insurance_company: 'ICICI Lombard General Insurance Co.',
    insurance_policy: '3001/2026/094821',
    insurance_expiry: '12-May-2027',
    insurance_status: 'ACTIVE',
    puc_number: 'PUCC/TN01/2026/84291',
    puc_expiry: '18-Nov-2026',
    puc_status: 'ACTIVE',
    tax_status: 'Life Time Tax (LTT) - Paid & Verified',
    hypothecation: 'HDFC Bank Ltd - Auto Loan Division',
    blacklist_status: 'CLEAN'
  },
  TN02CD5678: {
    registration_number: 'TN02CD5678',
    formatted_number: 'TN 02 CD 5678',
    owner_name: 'Kavitha Narayanan',
    father_name: 'S. Narayanan',
    rto_code: 'TN02',
    rto_office: 'TN-02 Chennai North-West RTO (Anna Nagar), Tamil Nadu',
    state: 'Tamil Nadu',
    maker: 'Maruti Suzuki India Ltd',
    model: 'Swift ZXi+ 1.2L DualJet Dual Tone',
    vehicle_class: 'Motor Car (LMV - Private)',
    body_type: 'Hatchback',
    fuel_type: 'Petrol',
    emission_norms: 'BS-VI Phase 2',
    color: 'Pearl Arctic White with Midnight Black Roof',
    engine_number: 'K12N*9381023',
    chassis_number: 'MA3FBE31S*0982142',
    registration_date: '21-Aug-2023',
    vehicle_age: '3 Years, 1 Month',
    fitness_upto: '20-Aug-2038',
    rc_status: 'ACTIVE',
    insurance_company: 'HDFC ERGO General Insurance Co. Ltd',
    insurance_policy: '2311/2026/889214',
    insurance_expiry: '19-Aug-2027',
    insurance_status: 'ACTIVE',
    puc_number: 'PUCC/TN02/2026/19482',
    puc_expiry: '15-Dec-2026',
    puc_status: 'ACTIVE',
    tax_status: 'Life Time Tax (LTT) - Paid & Verified',
    hypothecation: 'State Bank of India Car Loan',
    blacklist_status: 'CLEAN'
  },
  DL01XY9999: {
    registration_number: 'DL01XY9999',
    formatted_number: 'DL 01 XY 9999',
    owner_name: 'Vikramaditya Oberoi',
    father_name: 'Harish Oberoi',
    rto_code: 'DL01',
    rto_office: 'DL-01 Mall Road (North Delhi) RTO, Delhi',
    state: 'Delhi',
    maker: 'Tata Motors Passenger Vehicles Ltd',
    model: 'Nexon EV Empowered Plus Long Range',
    vehicle_class: 'Electric Passenger Vehicle (e-LMV)',
    body_type: 'Electric SUV',
    fuel_type: 'Electric (Battery EV)',
    emission_norms: 'Zero Emission Vehicle (ZEV)',
    color: 'Empowered Oxide Dual Tone',
    engine_number: 'EM30*8812903',
    chassis_number: 'MAT62349*N049182',
    registration_date: '08-Jan-2024',
    vehicle_age: '2 Years, 8 Months',
    fitness_upto: '07-Jan-2039',
    rc_status: 'ACTIVE',
    insurance_company: 'Tata AIG General Insurance Co.',
    insurance_policy: '0159/2026/994820',
    insurance_expiry: '06-Jan-2027',
    insurance_status: 'ACTIVE',
    puc_number: 'EXEMPT/EV/DL01/2024',
    puc_expiry: 'Exempt (Electric Vehicle)',
    puc_status: 'ACTIVE',
    tax_status: 'Delhi EV Policy - 100% Road Tax Exemption Applied',
    hypothecation: 'Kotak Mahindra Prime Car Finance',
    blacklist_status: 'CLEAN'
  },
  MH12DE4567: {
    registration_number: 'MH12DE4567',
    formatted_number: 'MH 12 DE 4567',
    owner_name: 'Sachin Madhav Deshmukh',
    father_name: 'Madhav Deshmukh',
    rto_code: 'MH12',
    rto_office: 'MH-12 Pune RTO, Maharashtra',
    state: 'Maharashtra',
    maker: 'Mahindra & Mahindra Ltd',
    model: 'Scorpio-N Z8L 4x4 Automatic 2.2 mHawk',
    vehicle_class: 'Motor Car (LMV - Private)',
    body_type: 'Heavy SUV',
    fuel_type: 'Diesel',
    emission_norms: 'BS-VI Phase 2',
    color: 'Napoli Black',
    engine_number: 'D22*0948123',
    chassis_number: 'MA1TA2W*P049281',
    registration_date: '10-Oct-2022',
    vehicle_age: '3 Years, 11 Months',
    fitness_upto: '09-Oct-2037',
    rc_status: 'ACTIVE',
    insurance_company: 'Bajaj Allianz General Insurance Ltd',
    insurance_policy: 'OG-26-1901-1801-0004921',
    insurance_expiry: '08-Oct-2026',
    insurance_status: 'ACTIVE',
    puc_number: 'PUCC/MH12/2026/04918',
    puc_expiry: '25-Sep-2026',
    puc_status: 'ACTIVE',
    tax_status: 'Life Time Tax (LTT) - Paid & Verified',
    hypothecation: 'Axis Bank Vehicle Finance',
    blacklist_status: 'CLEAN'
  },
  KA03MG8899: {
    registration_number: 'KA03MG8899',
    formatted_number: 'KA 03 MG 8899',
    owner_name: 'Ananya S. Rao',
    father_name: 'Suresh Rao',
    rto_code: 'KA03',
    rto_office: 'KA-03 Bangalore East (Indiranagar) RTO, Karnataka',
    state: 'Karnataka',
    maker: 'Honda Motorcycle & Scooter India',
    model: 'Activa 6G Deluxe 110cc Smart Key',
    vehicle_class: 'Two Wheeler (MCWG - Scooter)',
    body_type: 'Scooter',
    fuel_type: 'Petrol',
    emission_norms: 'BS-VI',
    color: 'Rebel Red Metallic',
    engine_number: 'JF50E*8921471',
    chassis_number: 'ME4JF504*M038291',
    registration_date: '16-Feb-2023',
    vehicle_age: '3 Years, 7 Months',
    fitness_upto: '15-Feb-2038',
    rc_status: 'ACTIVE',
    insurance_company: 'The New India Assurance Co. Ltd',
    insurance_policy: '1201003126010008492',
    insurance_expiry: '14-Feb-2027',
    insurance_status: 'ACTIVE',
    puc_number: 'PUCC/KA03/2026/33918',
    puc_expiry: '10-Oct-2026',
    puc_status: 'ACTIVE',
    tax_status: 'Life Time Tax (LTT) - Paid',
    hypothecation: 'No Hypothecation (Owned)',
    blacklist_status: 'CLEAN'
  },
  UP16Z9901: {
    registration_number: 'UP16Z9901',
    formatted_number: 'UP 16 Z 9901',
    owner_name: 'Amit Kumar Verma',
    father_name: 'Dinesh Verma',
    rto_code: 'UP16',
    rto_office: 'UP-16 Noida (Gautam Buddha Nagar) RTO, Uttar Pradesh',
    state: 'Uttar Pradesh',
    maker: 'Kia India Pvt Ltd',
    model: 'Seltos GTX Plus 1.5 Turbo DCT',
    vehicle_class: 'Motor Car (LMV - Private)',
    body_type: 'Mid-size SUV',
    fuel_type: 'Petrol',
    emission_norms: 'BS-VI Phase 2',
    color: 'Imperial Blue',
    engine_number: 'G4FV*9918231',
    chassis_number: 'MZBDC812*P084912',
    registration_date: '04-Dec-2023',
    vehicle_age: '2 Years, 9 Months',
    fitness_upto: '03-Dec-2038',
    rc_status: 'ACTIVE',
    insurance_company: 'Go Digit General Insurance',
    insurance_policy: 'D091264821/2026',
    insurance_expiry: '02-Dec-2026',
    insurance_status: 'ACTIVE',
    puc_number: 'PUCC/UP16/2026/71928',
    puc_expiry: '19-Nov-2026',
    puc_status: 'ACTIVE',
    tax_status: 'Life Time Tax (LTT) - Paid',
    hypothecation: 'Punjab National Bank Car Loan',
    blacklist_status: 'CLEAN'
  }
};

// -------------------------------------------------------------
// SEED CHALLANS
// -------------------------------------------------------------
const INITIAL_CHALLANS: Challan[] = [
  {
    id: 'CH-2026-TN01-8921',
    vehicle_number: 'TN01AB1234',
    violation: 'Red Light Signal Violation',
    section: 'Section 119/177 - Motor Vehicles Act 1988',
    date: '16-Aug-2026',
    time: '11:42 AM',
    location: 'Main Road Junction, Anna Salai Intersect',
    fine: 1000,
    status: 'Unpaid',
    detection_source: 'AI Automated ANPR Signal Camera #04',
    image_url: '/static/images/traffic.jpg'
  },
  {
    id: 'CH-2026-TN01-4491',
    vehicle_number: 'TN01AB1234',
    violation: 'Driving Without Wearing Fastened Seat Belt',
    section: 'Section 194B - Motor Vehicles Act',
    date: '28-Jun-2026',
    time: '04:15 PM',
    location: 'Guindy Race Course Road Checkpoint',
    fine: 1000,
    status: 'Paid',
    detection_source: 'CCTV Surveillance Camera #12',
    payment_date: '02-Jul-2026',
    payment_transaction_id: 'TXN-98214029482',
    receipt_number: 'RCPT-TN01-84921'
  },
  {
    id: 'CH-2026-TN02-7712',
    vehicle_number: 'TN02CD5678',
    violation: 'Exceeding Permitted Speed Limit (>78 km/h in 50 km/h Zone)',
    section: 'Section 112/183(1) - Motor Vehicles Act',
    date: '15-Aug-2026',
    time: '08:20 PM',
    location: 'Anna Nagar 2nd Avenue Express Corridor',
    fine: 750,
    status: 'Unpaid',
    detection_source: 'Automatic Speed Radar Gun Unit #08',
    image_url: '/static/images/image2.jpg'
  },
  {
    id: 'CH-2026-DL01-1092',
    vehicle_number: 'DL01XY9999',
    violation: 'Stopping / Parking in Designated Emergency Bus Lane',
    section: 'Section 122/177 - Motor Vehicles Act',
    date: '22-Aug-2026',
    time: '02:30 PM',
    location: 'Ring Road Mall Road North Terminal',
    fine: 500,
    status: 'Paid',
    detection_source: 'Traffic Enforcement Patrol Unit S-19',
    payment_date: '24-Aug-2026',
    payment_transaction_id: 'TXN-00491829481',
    receipt_number: 'RCPT-DL01-38291'
  },
  {
    id: 'CH-2026-MH12-3491',
    vehicle_number: 'MH12DE4567',
    violation: 'Using Handheld Mobile Phone While Driving',
    section: 'Section 184(c)/177 - Dangerous Driving / Distracted Driving',
    date: '04-Sep-2026',
    time: '03:12 PM',
    location: 'FC Road - Shivajinagar Junction, Pune',
    fine: 1500,
    status: 'Unpaid',
    detection_source: 'AI HD Optical Traffic Sentinel Unit #03',
    image_url: '/static/images/image1.jpg'
  },
  {
    id: 'CH-2026-KA03-6821',
    vehicle_number: 'KA03MG8899',
    violation: 'Riding Without Standard Protective Safety Helmet',
    section: 'Section 129/194D - Motor Vehicles Act',
    date: '01-Sep-2026',
    time: '09:45 AM',
    location: 'Indiranagar 100ft Road Intersect, Bengaluru',
    fine: 1000,
    status: 'Unpaid',
    detection_source: 'Bengaluru Smart City AI Traffic Camera #22'
  }
];

// -------------------------------------------------------------
// SEED CITIZEN REPORTS
// -------------------------------------------------------------
const INITIAL_REPORTS: CitizenReport[] = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    location: 'Main Road Junction, Anna Salai',
    issue_type: 'Traffic Light Failure',
    description: 'Signal stuck on red timer causing vehicle backup across lanes.',
    date_time: '03-09-2026 01:47 PM',
    status: 'Pending',
    assigned_officer: 'Inspector V. Balaji'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    location: 'Hospital Approach Road, Metro Gate 2',
    issue_type: 'Road Hazard / Pothole',
    description: 'Deep road depression near emergency vehicle turn.',
    date_time: '04-09-2026 10:15 AM',
    status: 'Resolved',
    assigned_officer: 'Road Maintenance Team Alpha',
    resolution_notes: 'Asphalt resurfacing completed by PWD overnight team.'
  },
  {
    id: 3,
    name: 'Anand V.',
    location: 'City Bypass Road, Km 12',
    issue_type: 'Severe Congestion',
    description: 'Stalled cargo lorry partially blocking westbound corridor.',
    date_time: '05-09-2026 04:30 PM',
    status: 'In Progress',
    assigned_officer: 'Highway Patrol Tow Unit 4'
  }
];

// -------------------------------------------------------------
// SEED EMERGENCIES
// -------------------------------------------------------------
const INITIAL_EMERGENCIES: EmergencyRequest[] = [
  {
    id: 'EMG-2026-881',
    name: 'Dr. K. Swaminathan (Apollo Hospital)',
    vehicle_number: 'TN01AM9110',
    emergency_type: 'Ambulance Passage',
    location: 'Greams Road to Rajiv Gandhi Government Hospital Corridor',
    description: 'Critical cardiac transfer patient requiring immediate green corridor clearance.',
    reported_at: '09-Sep-2026 09:30 AM',
    status: 'Green Corridor Active',
    priority: 'CRITICAL',
    assigned_unit: 'Traffic Control Room Dispatch 1'
  },
  {
    id: 'EMG-2026-724',
    name: 'Arjun Das',
    vehicle_number: 'TN09BX3322',
    emergency_type: 'Severe Accident',
    location: 'Airport Expressway Overpass, Lane 2',
    description: 'Two passenger cars collision, traffic diversion needed immediately.',
    reported_at: '08-Sep-2026 06:15 PM',
    status: 'Resolved',
    priority: 'HIGH',
    assigned_unit: 'Rapid Action Patrol Unit 7'
  }
];

// -------------------------------------------------------------
// SEED TRAFFIC SIGNALS
// -------------------------------------------------------------
const INITIAL_SIGNALS: TrafficSignal[] = [
  {
    id: 'SIG-01',
    junction_name: 'Anna Salai - Mount Road Junction',
    location: 'Central Corridor (Lanes 1-4)',
    current_phase: 'NORTH_SOUTH_GREEN',
    green_duration_seconds: 45,
    red_duration_seconds: 35,
    mode: 'AI Dynamic Adaptive',
    congestion_level: 'Moderate',
    congestion_percentage: 58,
    ambulance_detected: false,
    active_vehicles_count: 38,
    last_updated: 'Just now'
  },
  {
    id: 'SIG-02',
    junction_name: 'Hospital Emergency Corridor Junction',
    location: 'Medical Zone Gate 1',
    current_phase: 'EMERGENCY_AMBULANCE_OVERRIDE',
    green_duration_seconds: 60,
    red_duration_seconds: 15,
    mode: 'Emergency Green Wave',
    congestion_level: 'Low',
    congestion_percentage: 24,
    ambulance_detected: true,
    active_vehicles_count: 14,
    last_updated: 'Just now'
  },
  {
    id: 'SIG-03',
    junction_name: 'City Ring Road - Tech Park Flyover',
    location: 'East Outer Express Hub',
    current_phase: 'EAST_WEST_GREEN',
    green_duration_seconds: 50,
    red_duration_seconds: 40,
    mode: 'AI Dynamic Adaptive',
    congestion_level: 'Heavy',
    congestion_percentage: 82,
    ambulance_detected: false,
    active_vehicles_count: 64,
    last_updated: 'Just now'
  }
];

// -------------------------------------------------------------
// SEED TRAFFIC ALERTS
// -------------------------------------------------------------
const INITIAL_ALERTS: TrafficAlert[] = [
  {
    id: 'ALT-101',
    title: '🚨 Emergency Ambulance Green Wave Corridor',
    type: 'Emergency Clearance',
    location: 'Anna Salai to Rajiv Gandhi General Hospital',
    severity: 'HIGH',
    message: 'Active emergency vehicle transit in progress. Motorists are requested to yield lane 1 immediately.',
    issued_at: '10:15 AM Today',
    valid_till: '12:00 PM Today',
    active: true
  },
  {
    id: 'ALT-102',
    title: '🚧 Metro Line Expansion & Lane Diversion',
    type: 'Diversion',
    location: 'Airport Road between Pillar 45 and 62',
    severity: 'MEDIUM',
    message: 'Westbound lane restricted for structural metro girder installation. Heavy vehicles diverted via Inner Ring Road.',
    issued_at: '06:00 AM Today',
    valid_till: '11:00 PM Today',
    active: true
  },
  {
    id: 'ALT-103',
    title: '🌧️ Heavy Rain & Reduced Visibility Advisory',
    type: 'Warning',
    location: 'Coastal Expressway Corridor',
    severity: 'LOW',
    message: 'Wet pavement and occasional hydroplaning risk. Advisory speed limit reduced to 40 km/h.',
    issued_at: '08:00 AM Today',
    valid_till: '08:00 PM Today',
    active: true
  }
];

// -------------------------------------------------------------
// DATABASE STORE CLASS
// -------------------------------------------------------------
class DatabaseStore {
  private vehicles: Record<string, Vehicle>;
  private challans: Challan[];
  private reports: CitizenReport[];
  private emergencies: EmergencyRequest[];
  private signals: TrafficSignal[];
  private alerts: TrafficAlert[];

  constructor() {
    this.vehicles = loadJson('vehicles.json', INITIAL_VEHICLES);
    this.challans = loadJson('challans.json', INITIAL_CHALLANS);
    this.reports = loadJson('reports.json', INITIAL_REPORTS);
    this.emergencies = loadJson('emergencies.json', INITIAL_EMERGENCIES);
    this.signals = loadJson('signals.json', INITIAL_SIGNALS);
    this.alerts = loadJson('alerts.json', INITIAL_ALERTS);
  }

  // --- VEHICLES & RTO REGISTRY ---
  public getVehicle(rawRegNumber: string): { vehicle: Vehicle; challans: Challan[] } {
    const normalized = this.normalizeRegNumber(rawRegNumber);

    // 1. Check existing vehicle in DB
    if (this.vehicles[normalized]) {
      const v = this.vehicles[normalized];
      const c = this.challans.filter(ch => this.normalizeRegNumber(ch.vehicle_number) === normalized);
      return { vehicle: v, challans: c };
    }

    // 2. Generate accurate, deterministic profile for ANY vehicle entered
    const generated = this.generateVehicleProfile(rawRegNumber);
    this.vehicles[normalized] = generated;
    saveJson('vehicles.json', this.vehicles);

    // Check if any challans match or create an initial status
    const c = this.challans.filter(ch => this.normalizeRegNumber(ch.vehicle_number) === normalized);
    return { vehicle: generated, challans: c };
  }

  public getAllVehicles(): Vehicle[] {
    return Object.values(this.vehicles);
  }

  public saveVehicle(vehicle: Vehicle): void {
    const normalized = this.normalizeRegNumber(vehicle.registration_number);
    this.vehicles[normalized] = vehicle;
    saveJson('vehicles.json', this.vehicles);
  }

  // --- CHALLANS ---
  public getChallansForVehicle(rawRegNumber: string): Challan[] {
    const normalized = this.normalizeRegNumber(rawRegNumber);
    return this.challans.filter(c => this.normalizeRegNumber(c.vehicle_number) === normalized);
  }

  public getAllChallans(): Challan[] {
    return [...this.challans].reverse();
  }

  public addChallan(challanData: Omit<Challan, 'id' | 'date' | 'time' | 'status' | 'section'> & Partial<Challan>): Challan {
    const cleanNum = this.normalizeRegNumber(challanData.vehicle_number);
    const id = challanData.id || `CH-2026-${cleanNum.substring(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newChallan: Challan = {
      id,
      vehicle_number: cleanNum,
      violation: challanData.violation,
      section: challanData.section || 'Motor Vehicles Act (MVA Enforcement)',
      date: challanData.date || dateStr,
      time: challanData.time || timeStr,
      location: challanData.location,
      fine: challanData.fine,
      status: challanData.status || 'Unpaid',
      detection_source: challanData.detection_source || 'AI Automated Camera Network',
      image_url: challanData.image_url || '/static/images/traffic.jpg'
    };

    this.challans.push(newChallan);
    saveJson('challans.json', this.challans);
    return newChallan;
  }

  public payChallan(challanId: string): Challan | null {
    const challan = this.challans.find(c => c.id === challanId);
    if (challan) {
      challan.status = 'Paid';
      challan.payment_date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      challan.payment_transaction_id = 'TXN-' + Math.floor(100000000000 + Math.random() * 900000000000);
      challan.receipt_number = 'RCPT-' + challan.id.replace('CH-', '') + '-' + Math.floor(1000 + Math.random() * 9000);
      saveJson('challans.json', this.challans);
      return challan;
    }
    return null;
  }

  // --- CITIZEN REPORTS ---
  public getReports(): CitizenReport[] {
    return [...this.reports].reverse();
  }

  public addReport(report: Omit<CitizenReport, 'id' | 'date_time' | 'status'> & Partial<CitizenReport>): CitizenReport {
    const maxId = this.reports.reduce((max, r) => Math.max(max, r.id), 0);
    const now = new Date();
    const dateStr =
      String(now.getDate()).padStart(2, '0') +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      now.getFullYear() +
      ' ' +
      now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newReport: CitizenReport = {
      id: maxId + 1,
      name: report.name,
      location: report.location,
      issue_type: report.issue_type,
      description: report.description,
      date_time: report.date_time || dateStr,
      status: report.status || 'Pending',
      image_url: report.image_url,
      assigned_officer: report.assigned_officer,
      resolution_notes: report.resolution_notes
    };
    this.reports.push(newReport);
    saveJson('reports.json', this.reports);
    return newReport;
  }

  public updateReportStatus(id: number, status: 'Pending' | 'In Progress' | 'Resolved', officer?: string, notes?: string): CitizenReport | null {
    const report = this.reports.find(r => r.id === id);
    if (report) {
      report.status = status;
      if (officer) report.assigned_officer = officer;
      if (notes) report.resolution_notes = notes;
      saveJson('reports.json', this.reports);
      return report;
    }
    return null;
  }

  public deleteReport(id: number): boolean {
    const initialLen = this.reports.length;
    this.reports = this.reports.filter(r => r.id !== id);
    if (this.reports.length !== initialLen) {
      saveJson('reports.json', this.reports);
      return true;
    }
    return false;
  }

  // --- EMERGENCIES ---
  public getEmergencies(): EmergencyRequest[] {
    return [...this.emergencies].reverse();
  }

  public addEmergency(data: Omit<EmergencyRequest, 'id' | 'reported_at' | 'status' | 'priority'> & { priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' }): EmergencyRequest {
    const id = 'EMG-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
    const now = new Date();
    const reported_at = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newEmergency: EmergencyRequest = {
      id,
      name: data.name,
      vehicle_number: this.normalizeRegNumber(data.vehicle_number),
      emergency_type: data.emergency_type,
      location: data.location,
      description: data.description,
      reported_at,
      status: 'Alert Received',
      priority: data.priority || 'HIGH'
    };

    this.emergencies.push(newEmergency);
    saveJson('emergencies.json', this.emergencies);
    return newEmergency;
  }

  public updateEmergencyStatus(id: string, status: EmergencyRequest['status'], assigned_unit?: string): EmergencyRequest | null {
    const emergency = this.emergencies.find(e => e.id === id);
    if (emergency) {
      emergency.status = status;
      if (assigned_unit) emergency.assigned_unit = assigned_unit;
      saveJson('emergencies.json', this.emergencies);
      return emergency;
    }
    return null;
  }

  // --- SIGNALS ---
  public getSignals(): TrafficSignal[] {
    return this.signals;
  }

  public updateSignal(id: string, updates: Partial<TrafficSignal>): TrafficSignal | null {
    const sig = this.signals.find(s => s.id === id);
    if (sig) {
      Object.assign(sig, updates, { last_updated: 'Just now' });
      saveJson('signals.json', this.signals);
      return sig;
    }
    return null;
  }

  // --- ALERTS ---
  public getAlerts(): TrafficAlert[] {
    return this.alerts.filter(a => a.active);
  }

  public addAlert(alert: Omit<TrafficAlert, 'id' | 'issued_at' | 'active'>): TrafficAlert {
    const id = 'ALT-' + Math.floor(100 + Math.random() * 900);
    const newAlert: TrafficAlert = {
      ...alert,
      id,
      issued_at: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) + ' Today',
      active: true
    };
    this.alerts.unshift(newAlert);
    saveJson('alerts.json', this.alerts);
    return newAlert;
  }

  // -----------------------------------------------------------
  // HELPER: NORMALIZE & PARSE ANY VEHICLE NUMBER
  // -----------------------------------------------------------
  public normalizeRegNumber(input: string): string {
    return (input || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  public formatRegNumber(normalized: string): string {
    // Format e.g. "TN01AB1234" -> "TN 01 AB 1234"
    const match = normalized.match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`.replace(/\s+/g, ' ').trim();
    }
    return normalized;
  }

  // Deterministic algorithm for ANY vehicle number entered
  public generateVehicleProfile(rawRegNumber: string): Vehicle {
    const clean = this.normalizeRegNumber(rawRegNumber);
    const formatted = this.formatRegNumber(clean);

    // Extract state and district
    const stateMatch = clean.match(/^([A-Z]{2})/);
    const stateCode = stateMatch ? stateMatch[1] : 'TN';
    const stateName = STATE_NAMES[stateCode] || 'Tamil Nadu';

    const rtoMatch = clean.match(/^([A-Z]{2}\d{1,2})/);
    const rtoCode = rtoMatch ? rtoMatch[1] : `${stateCode}01`;
    const rtoOffice = RTO_OFFICES[rtoCode] || `${rtoCode} Regional Transport Office, ${stateName}`;

    // Hash the string to generate deterministic realistic values
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = (hash << 5) - hash + clean.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    // Deterministic vehicle classes and models
    const vehicleProfiles = [
      {
        maker: 'Maruti Suzuki India Ltd',
        model: 'Swift ZXi+ 1.2L DualJet',
        vehicle_class: 'Motor Car (LMV - Private)',
        body_type: 'Hatchback',
        fuel_type: 'Petrol',
        emission_norms: 'BS-VI Phase 2',
        color: 'Pearl Arctic White',
        engine_prefix: 'K12N',
        chassis_prefix: 'MA3FBE31S'
      },
      {
        maker: 'Hyundai Motor India Ltd',
        model: 'Creta SX(O) 1.5 CRDi Diesel',
        vehicle_class: 'Motor Car (LMV - Private)',
        body_type: 'SUV / Compact Crossover',
        fuel_type: 'Diesel',
        emission_norms: 'BS-VI Phase 2',
        color: 'Titan Grey Metallic',
        engine_prefix: 'D4FA',
        chassis_prefix: 'MALC181CL'
      },
      {
        maker: 'Tata Motors Passenger Vehicles Ltd',
        model: 'Nexon Fearless Plus 1.2 Turbo',
        vehicle_class: 'Motor Car (LMV - Private)',
        body_type: 'Compact SUV',
        fuel_type: 'Petrol',
        emission_norms: 'BS-VI Phase 2',
        color: 'Daytona Grey',
        engine_prefix: 'REVOTORQ',
        chassis_prefix: 'MAT623491'
      },
      {
        maker: 'Honda Motorcycle & Scooter India',
        model: 'Activa 6G DLX 110cc Smart Key',
        vehicle_class: 'Two Wheeler (MCWG - Scooter)',
        body_type: 'Scooter',
        fuel_type: 'Petrol',
        emission_norms: 'BS-VI',
        color: 'Matte Axis Grey Metallic',
        engine_prefix: 'JF50E',
        chassis_prefix: 'ME4JF504'
      },
      {
        maker: 'Royal Enfield (Eicher Motors)',
        model: 'Classic 350 Dual Channel ABS',
        vehicle_class: 'Two Wheeler (MCWG - Motorcycle)',
        body_type: 'Cruiser Motorcycle',
        fuel_type: 'Petrol',
        emission_norms: 'BS-VI',
        color: 'Stealth Black',
        engine_prefix: 'J1-349',
        chassis_prefix: 'ME3J350DL'
      },
      {
        maker: 'Mahindra & Mahindra Ltd',
        model: 'Thar 4x4 LX Hard Top 2.2 mHawk',
        vehicle_class: 'Motor Car (LMV - Private)',
        body_type: '4x4 Off-Road SUV',
        fuel_type: 'Diesel',
        emission_norms: 'BS-VI Phase 2',
        color: 'Napoli Black',
        engine_prefix: 'MHAWK22',
        chassis_prefix: 'MA1TA2W'
      },
      {
        maker: 'Toyota Kirloskar Motor Pvt Ltd',
        model: 'Innova Crysta 2.4 VX 7-Seater',
        vehicle_class: 'Multi Utility Vehicle (MUV)',
        body_type: 'MUV',
        fuel_type: 'Diesel',
        emission_norms: 'BS-VI',
        color: 'Silver Metallic',
        engine_prefix: '2GD-FTV',
        chassis_prefix: 'MBJ11BB5'
      },
      {
        maker: 'Kia India Pvt Ltd',
        model: 'Seltos HTX Plus 1.5 Smartstream',
        vehicle_class: 'Motor Car (LMV - Private)',
        body_type: 'Mid-size SUV',
        fuel_type: 'Petrol',
        emission_norms: 'BS-VI Phase 2',
        color: 'Glacier White Pearl',
        engine_prefix: 'G4FL',
        chassis_prefix: 'MZBDC81'
      },
      {
        maker: 'Bajaj Auto Ltd',
        model: 'Pulsar NS200 Dual ABS',
        vehicle_class: 'Two Wheeler (MCWG - Motorcycle)',
        body_type: 'Sports Motorcycle',
        fuel_type: 'Petrol',
        emission_norms: 'BS-VI',
        color: 'Burnt Red Satin',
        engine_prefix: 'JL50N',
        chassis_prefix: 'MD2A18AX'
      }
    ];

    const profileIndex = absHash % vehicleProfiles.length;
    const vp = vehicleProfiles[profileIndex];

    const firstNames = ['Arun', 'Pooja', 'Vikram', 'Ananya', 'Rohan', 'Deepak', 'Suresh', 'Kavita', 'Mohit', 'Sunita', 'Naveen', 'Meenakshi', 'Gaurav', 'Shweta', 'Rajesh', 'Sanjay', 'Karthik', 'Divya'];
    const lastNames = ['Kumar', 'Sharma', 'Verma', 'Reddy', 'Patel', 'Nair', 'Iyer', 'Chatterjee', 'Deshmukh', 'Singh', 'Gupta', 'Mehta', 'Sundaram', 'Pillai', 'Rao', 'Choudhary'];

    const fName = firstNames[absHash % firstNames.length];
    const lName = lastNames[(absHash >> 2) % lastNames.length];
    const fatherFName = firstNames[(absHash >> 3) % firstNames.length];

    const regYear = 2020 + (absHash % 5); // 2020 to 2024
    const regMonth = 1 + (absHash % 12);
    const regDay = 1 + (absHash % 28);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const regDateStr = `${String(regDay).padStart(2, '0')}-${months[regMonth - 1]}-${regYear}`;
    const fitnessUptoStr = `${String(regDay).padStart(2, '0')}-${months[regMonth - 1]}-${regYear + 15}`;
    const vehicleAgeYears = 2026 - regYear;
    const vehicleAgeStr = `${vehicleAgeYears} Years, ${(absHash % 11) + 1} Months`;

    const insuranceCompanies = [
      'ICICI Lombard General Insurance Co. Ltd',
      'HDFC ERGO General Insurance Co.',
      'Bajaj Allianz General Insurance Co. Ltd',
      'The New India Assurance Co. Ltd',
      'Tata AIG General Insurance Co. Ltd',
      'Go Digit General Insurance'
    ];
    const insuranceComp = insuranceCompanies[absHash % insuranceCompanies.length];
    const policyNum = `${1000 + (absHash % 8999)}/2026/${100000 + (absHash % 899999)}`;
    const insExpMonth = months[(regMonth + 4) % 12];
    const insuranceExpiry = `28-${insExpMonth}-2027`;

    const pucNum = `PUCC/${rtoCode}/2026/${10000 + (absHash % 89999)}`;
    const pucExpMonth = months[(regMonth + 8) % 12];
    const pucExpiry = `15-${pucExpMonth}-2026`;

    const hypothecations = [
      'HDFC Bank Ltd - Auto Loan Division',
      'State Bank of India (Car Loan Cell)',
      'ICICI Bank Vehicle Finance',
      'Axis Bank Retail Auto Loan',
      'No Hypothecation (Fully Owned)'
    ];
    const hypothecation = hypothecations[absHash % hypothecations.length];

    const engineNum = `${vp.engine_prefix}*${1000000 + (absHash % 8999999)}`;
    const chassisNum = `${vp.chassis_prefix}*${1000000 + ((absHash * 3) % 8999999)}`;

    const generatedVehicle: Vehicle = {
      registration_number: clean,
      formatted_number: formatted,
      owner_name: `${fName} ${lName}`,
      father_name: `${fatherFName} ${lName}`,
      rto_code: rtoCode,
      rto_office: rtoOffice,
      state: stateName,
      maker: vp.maker,
      model: vp.model,
      vehicle_class: vp.vehicle_class,
      body_type: vp.body_type,
      fuel_type: vp.fuel_type,
      emission_norms: vp.emission_norms,
      color: vp.color,
      engine_number: engineNum,
      chassis_number: chassisNum,
      registration_date: regDateStr,
      vehicle_age: vehicleAgeStr,
      fitness_upto: fitnessUptoStr,
      rc_status: 'ACTIVE',
      insurance_company: insuranceComp,
      insurance_policy: policyNum,
      insurance_expiry: insuranceExpiry,
      insurance_status: 'ACTIVE',
      puc_number: pucNum,
      puc_expiry: pucExpiry,
      puc_status: 'ACTIVE',
      tax_status: 'Life Time Tax (LTT) - Paid & Verified',
      hypothecation: hypothecation,
      blacklist_status: 'CLEAN'
    };

    // If absHash % 3 == 0, generate a sample pending challan for this vehicle so they can test violation payment!
    if (absHash % 3 === 0) {
      const violationsList = [
        { name: 'Red Light Signal Violation', sec: 'Section 119/177 MVA', fine: 1000, loc: `${stateName} High Traffic Intersection #03` },
        { name: 'Exceeding Permitted Speed Limit', sec: 'Section 112/183 MVA', fine: 1000, loc: `Expressway Km ${14 + (absHash % 40)}` },
        { name: 'Riding Without Protective Helmet / Seatbelt', sec: 'Section 129/194D MVA', fine: 1000, loc: 'City Central Roadway' },
        { name: 'Unauthorized Parking in No-Parking Zone', sec: 'Section 122/177 MVA', fine: 500, loc: 'Commercial High Street' }
      ];
      const viol = violationsList[absHash % violationsList.length];
      const challanId = `CH-2026-${rtoCode}-${1000 + (absHash % 8999)}`;
      const newChallan: Challan = {
        id: challanId,
        vehicle_number: clean,
        violation: viol.name,
        section: viol.sec,
        date: '02-Sep-2026',
        time: '11:20 AM',
        location: viol.loc,
        fine: viol.fine,
        status: 'Unpaid',
        detection_source: 'AI Automated Sentinel Camera Network',
        image_url: '/static/images/traffic.jpg'
      };
      this.challans.push(newChallan);
      saveJson('challans.json', this.challans);
    }

    return generatedVehicle;
  }
}

export const db = new DatabaseStore();
