import type { ClinicRecord, DashboardStats } from '../types';

const today = new Date().toISOString().slice(0, 10);
const record = (id: string, name: string, detail: string, status: string, amount?: number): ClinicRecord => ({
  id,
  name,
  detail,
  date: today,
  status,
  amount,
  initials: name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(),
  tone: ['mint', 'blue', 'peach', 'lavender'][Number(id.replace(/\D/g, '').slice(-1) || 0) % 4],
});

export const demoStats: DashboardStats = {
  todaysAppointments: 32,
  completed: 18,
  waiting: 6,
  cancelled: 2,
  noShows: 1,
  todaysRevenue: 28450,
  newPatients: 8,
  returningPatients: 14,
};

export const appointments = [
  record('a1', 'Aarav Sharma', 'Dr. Meera Kapoor · General Checkup', 'Confirmed', 800),
  record('a2', 'Ananya Verma', 'Dr. Rohan Mehta · Dermatology', 'Waiting', 1200),
  record('a3', 'Kabir Singh', 'Dr. Meera Kapoor · Follow-up', 'In progress', 600),
  record('a4', 'Diya Patel', 'Dr. Rohan Mehta · Consultation', 'Confirmed', 1200),
  record('a5', 'Ishaan Gupta', 'Dr. Meera Kapoor · General Checkup', 'Completed', 800),
];

export const patients = [
  record('p1', 'Aarav Sharma', '32 yrs · Male · +91 98765 43210', 'Active'),
  record('p2', 'Ananya Verma', '28 yrs · Female · +91 98123 45678', 'Active'),
  record('p3', 'Kabir Singh', '45 yrs · Male · +91 99887 76655', 'Follow-up'),
  record('p4', 'Diya Patel', '36 yrs · Female · +91 98765 11122', 'Active'),
  record('p5', 'Ishaan Gupta', '51 yrs · Male · +91 98989 12345', 'Inactive'),
];

export const doctors = [
  record('d1', 'Dr. Meera Kapoor', 'General Physician · 12 years experience', 'Available', 800),
  record('d2', 'Dr. Rohan Mehta', 'Dermatologist · 9 years experience', 'Available', 1200),
  record('d3', 'Dr. Nisha Shah', 'Pediatrician · 8 years experience', 'In consultation', 1000),
];

export const invoices = [
  record('i1', 'Aarav Sharma', 'INV-2025-001 · UPI', 'Paid', 800),
  record('i2', 'Ananya Verma', 'INV-2025-002 · Pending', 'Pending', 1200),
  record('i3', 'Kabir Singh', 'INV-2025-003 · Card', 'Paid', 600),
];

export const prescriptions = [
  record('rx1', 'Aarav Sharma', 'Dr. Meera Kapoor · General checkup', 'Ready'),
  record('rx2', 'Ananya Verma', 'Dr. Rohan Mehta · Skin allergy', 'Sent'),
  record('rx3', 'Kabir Singh', 'Dr. Meera Kapoor · Follow-up', 'Draft'),
];

export function recordsFor(path: string): ClinicRecord[] | null {
  if (path === '/appointments') return appointments;
  if (path === '/patients') return patients;
  if (path === '/doctors') return doctors;
  if (path === '/billing') return invoices;
  if (path === '/prescriptions') return prescriptions;
  if (path === '/queue') return appointments.filter((item) => item.status === 'Waiting' || item.status === 'In progress');
  if (path === '/reviews') return [
    record('r1', 'Priya Nair', '★★★★★ · The staff was warm and professional.', 'Published'),
    record('r2', 'Rohit Das', '★★★★☆ · Quick appointment and clear advice.', 'Published'),
  ];
  if (path === '/campaigns') return [
    record('c1', 'Monsoon wellness checkup', 'WhatsApp · 248 recipients', 'Active'),
    record('c2', 'Annual follow-up reminder', 'SMS · 86 recipients', 'Scheduled'),
  ];
  if (path === '/communications') return [
    record('m1', 'Appointment reminder', 'WhatsApp · Aarav Sharma', 'Delivered'),
    record('m2', 'Payment receipt', 'Email · Kabir Singh', 'Sent'),
  ];
  if (path === '/analytics') return [];
  return null;
}

export function addDemoRecord(path: string, name: string, detail: string): ClinicRecord {
  const items = recordsFor(path);
  if (!items) throw new Error('This feature is not available in demo mode.');
  const row = record(`${Date.now()}`, name, detail || 'Added just now', 'New');
  items.unshift(row);
  return row;
}

export function updateDemoRecord(path: string, id: string, values: Partial<ClinicRecord>): ClinicRecord {
  const items = recordsFor(path);
  const current = items?.find((item) => item.id === id);
  if (!current || !items) throw new Error('Record not found in demo data.');
  Object.assign(current, values);
  return current;
}

export function deleteDemoRecord(path: string, id: string): void {
  const items = path === '/appointments' ? appointments
    : path === '/patients' ? patients
      : path === '/doctors' ? doctors
        : path === '/billing' ? invoices
          : path === '/prescriptions' ? prescriptions : null;
  if (!items) throw new Error('Delete is not available for this demo section.');
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('Record not found in demo data.');
  items.splice(index, 1);
}
