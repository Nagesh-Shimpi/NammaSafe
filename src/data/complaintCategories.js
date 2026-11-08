// Government Grievance Categories, Subcategories, District Geographies, and Mapping Rules
export const COMPLAINT_CATEGORIES = [
  {
    id: 'cat-roads',
    name: 'Roads and Infrastructure',
    nameKn: 'ರಸ್ತೆ ಮತ್ತು ಮೂಲಸೌಕರ್ಯ',
    departmentId: 'dept-1',
    departmentName: 'Ministry of Road Transport & Highways',
    icon: 'traffic',
    defaultSlaHours: 48,
    subcategories: [
      'Potholes and Crater Damage',
      'Flyover & Bridge Structural Issue',
      'Footpath / Pedestrian Walkway Encroachment',
      'Street Lighting Failure',
      'Road Divider / Signage Missing',
      'Drainage Flooding on Highway',
      'Unauthorized Speed Breaker'
    ]
  },
  {
    id: 'cat-water',
    name: 'Water Supply',
    nameKn: 'ಕುಡಿಯುವ ನೀರು ಸರಬರಾಜು',
    departmentId: 'dept-2',
    departmentName: 'Ministry of Jal Shakti (Water Supply)',
    icon: 'water_drop',
    defaultSlaHours: 48,
    subcategories: [
      'Contaminated / Brackish Drinking Water',
      'Low Water Pressure / Intermittent Supply',
      'Pipeline Burst / Street Flooding',
      'Irregular Billing / Faulty Water Meter',
      'Illegal Water Connection Tapping',
      'Borewell / RO Water Plant Dysfunction',
      'Water Tanker Non-Arrival'
    ]
  },
  {
    id: 'cat-electricity',
    name: 'Electricity',
    nameKn: 'ವಿದ್ಯುತ್ ಮತ್ತು ಇಂಧನ',
    departmentId: 'dept-4',
    departmentName: 'Power & Energy Distribution (BESCOM / HESCOM)',
    icon: 'bolt',
    defaultSlaHours: 24,
    subcategories: [
      'Power Outage / Grid Fluctuation',
      'Faulty Electric Meter / Overbilling',
      'Fallen Electric Pole / Loose Overhead Wire',
      'Distribution Transformer Breakdown',
      'Delay in New Meter Connection',
      'Voltage Fluctuation Damaging Appliances',
      'Hazardous Exposed Cable'
    ]
  },
  {
    id: 'cat-sanitation',
    name: 'Sanitation',
    nameKn: 'ಸ್ವಚ್ಛತೆ ಮತ್ತು ನೈರ್ಮಲ್ಯ',
    departmentId: 'dept-3',
    departmentName: 'Urban Development & Municipal Corp (BBMP)',
    icon: 'delete_sweep',
    defaultSlaHours: 48,
    subcategories: [
      'Overflowing Garbage Dumps / Bins',
      'Sewage Line Clogging / Backflow',
      'Open Defecation / Public Urinal Malfunction',
      'Dead Animal Removal Needed',
      'Waste Segregation Non-compliance',
      'Cesspool Odor Hazard'
    ]
  },
  {
    id: 'cat-health',
    name: 'Public Health',
    nameKn: 'ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ',
    departmentId: 'dept-7',
    departmentName: 'Health & Family Welfare Directorate',
    icon: 'medical_services',
    defaultSlaHours: 24,
    subcategories: [
      'Primary Health Centre (PHC) Doctor Absenteeism',
      'Medicine / Antivenom / Vaccine Stock Out',
      'Dengue / Malaria Mosquito Fogging Required',
      'Poor Sanitation / Hygiene in Govt Hospital',
      'Delay in Birth / Death Certificate',
      'Ambulance (108) Delay'
    ]
  },
  {
    id: 'cat-education',
    name: 'Education',
    nameKn: 'ಶಿಕ್ಷಣ ಇಲಾಖೆ',
    departmentId: 'dept-6',
    departmentName: 'Social Welfare & Senior Citizen Empowerment',
    icon: 'school',
    defaultSlaHours: 72,
    subcategories: [
      'Govt School Infrastructure Deficit (Toilets/Roof)',
      'Mid-Day Meal Quality Dispute',
      'Teacher Vacancy / Irregular Attendance',
      'Delay in Textbook / Uniform Disbursal',
      'RTE Scholarship / Fee Concession Issue',
      'School Drinking Water Contamination'
    ]
  },
  {
    id: 'cat-revenue',
    name: 'Revenue and Land Records',
    nameKn: 'ಕಂದಾಯ ಮತ್ತು ಭೂ ದಾಖಲೆಗಳು',
    departmentId: 'dept-3',
    departmentName: 'Urban Development & Municipal Corp (BBMP)',
    icon: 'landscape',
    defaultSlaHours: 96,
    subcategories: [
      'Mutation / Khata Transfer Delay',
      'Land Survey / Boundary Demarcation Dispute',
      'RTC / Pahani Name Correction Pending',
      'Caste / Income Certificate Verification Delay',
      'Delay in Title Deed / E-Swathu Registration',
      'Encroachment of Govt / Lake Land'
    ]
  },
  {
    id: 'cat-pds',
    name: 'Public Distribution System',
    nameKn: 'ಸಾರ್ವಜನಿಕ ವಿತರಣಾ ವ್ಯವಸ್ಥೆ (ರೇಷನ್)',
    departmentId: 'dept-5',
    departmentName: 'Food, Civil Supplies & Consumer Affairs',
    icon: 'local_mall',
    defaultSlaHours: 72,
    subcategories: [
      'Fair Price Shop Denial of Ration Quota',
      'Biometric / e-PoS Authentication Failure',
      'Substandard Food Grain Quality (Weevils/Dust)',
      'New Ration Card / BPL Card Inclusion Delay',
      'FPS Shop Closed During Working Hours',
      'LPG Subsidy Transfer Discrepancy'
    ]
  },
  {
    id: 'cat-municipal',
    name: 'Municipal Services',
    nameKn: 'ಪುರಸಭೆ / ಪಾಲಿಕೆ ಸೇವೆಗಳು',
    departmentId: 'dept-3',
    departmentName: 'Urban Development & Municipal Corp (BBMP)',
    icon: 'domain',
    defaultSlaHours: 72,
    subcategories: [
      'Illegal Construction / Buffer Zone Encroachment',
      'Trade License / Building Plan Approval Delay',
      'Property Tax Over-Assessment Dispute',
      'Stray Dog / Cattle Menace',
      'Park / Community Playground Upkeep',
      'Tree Branch Trimming Hazardous to Powerlines'
    ]
  },
  {
    id: 'cat-transport',
    name: 'Transportation',
    nameKn: 'ಸಾರಿಗೆ ಮತ್ತು ವಾಹನ ನಿಯಂತ್ರಣ',
    departmentId: 'dept-1',
    departmentName: 'Ministry of Road Transport & Highways',
    icon: 'directions_bus',
    defaultSlaHours: 48,
    subcategories: [
      'KSRTC / BMTC Bus Frequency Shortage',
      'Overcharging / Rudeness by Auto / Taxi Drivers',
      'Bus Shelter Damaged / Missing',
      'Traffic Signal Malfunction',
      'Driving License / RC Book Delay at RTO',
      'Unauthorized Parking Bottleneck'
    ]
  },
  {
    id: 'cat-other',
    name: 'Other Government Services',
    nameKn: 'ಇತರ ಸರ್ಕಾರಿ ಸೇವೆಗಳು',
    departmentId: 'dept-6',
    departmentName: 'Social Welfare & Senior Citizen Empowerment',
    icon: 'account_balance',
    defaultSlaHours: 96,
    subcategories: [
      'RTI Application Non-Compliance / Delay',
      'Senior Citizen / Widow Pension Disbursal Delay',
      'Disability Equipment Scheme Delay',
      'Grievance Call Centre Unresponsiveness',
      'General Administrative Inaction'
    ]
  }
];

// Karnataka District Geography hierarchy with Taluks
export const KARNATAKA_DISTRICTS = [
  {
    name: 'Bengaluru Urban',
    taluks: ['Bengaluru North', 'Bengaluru South', 'Bengaluru East', 'Anekal', 'Yelahanka']
  },
  {
    name: 'Bengaluru Rural',
    taluks: ['Devanahalli', 'Doddaballapura', 'Hosakote', 'Nelamangala']
  },
  {
    name: 'Mysuru',
    taluks: ['Mysuru', 'Nanjangud', 'Hunsur', 'T. Narasipura', 'Krishnarajanagara', 'Piriyapatna', 'Saragur']
  },
  {
    name: 'Belagavi',
    taluks: ['Belagavi', 'Gokak', 'Chikkodi', 'Athani', 'Bailhongal', 'Khanapur', 'Ramdurg', 'Saundatti']
  },
  {
    name: 'Hubballi-Dharwad',
    taluks: ['Hubballi Urban', 'Dharwad', 'Kundgol', 'Kalghatgi', 'Navalgund']
  },
  {
    name: 'Kalaburagi',
    taluks: ['Kalaburagi', 'Aland', 'Afzalpur', 'Chincholi', 'Chittapur', 'Jewargi', 'Sedam']
  },
  {
    name: 'Mangaluru (Dakshina Kannada)',
    taluks: ['Mangaluru', 'Bantwal', 'Beltangady', 'Puttur', 'Sullia', 'Moodbidri', 'Kadaba']
  },
  {
    name: 'Tumakuru',
    taluks: ['Tumakuru', 'Gubbi', 'Koratagere', 'Kunigal', 'Madhugiri', 'Pavagada', 'Sira', 'Tiptur', 'Turuvekere']
  },
  {
    name: 'Shivamogga',
    taluks: ['Shivamogga', 'Bhadravathi', 'Sagar', 'Shikaripura', 'Soraba', 'Thirthahalli', 'Hosanagara']
  },
  {
    name: 'Ballari',
    taluks: ['Ballari', 'Sandur', 'Siruguppa', 'Kampli', 'Kurugodu']
  }
];

