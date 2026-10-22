import { api, demoMode, unwrap } from './api';
import { addDemoRecord, deleteDemoRecord, demoStats, recordsFor, updateDemoRecord } from './mock';
import type { ClinicRecord, DashboardStats } from '../types';

type ApiRecord = Record<string, unknown>;
type CreateRecordInput = {
  name: string;
  detail: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  password?: string;
  specialization?: string;
  service?: string;
  patientId?: string;
  doctorId?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
};

const asRecords = (value: unknown): ApiRecord[] => {
  if (!Array.isArray(value)) throw new Error('The API returned an invalid records response.');
  return value as ApiRecord[];
};

const displayRecord = (record: ApiRecord, path: string): ClinicRecord => {
  const patient = typeof record.patientId === 'object' && record.patientId !== null ? record.patientId as ApiRecord : undefined;
  const doctor = typeof record.doctorId === 'object' && record.doctorId !== null ? record.doctorId as ApiRecord : undefined;
  const doctorUser = doctor?.userId && typeof doctor.userId === 'object' ? doctor.userId as ApiRecord : undefined;
  const name = path === '/appointments'
    ? String(patient?.name ?? 'Patient')
    : path === '/doctors' && record.userId && typeof record.userId === 'object'
      ? String((record.userId as ApiRecord).name ?? 'Doctor')
      : String(record.name ?? 'Record');
  const gender = String(record.gender ?? '').toLowerCase();
  const age = record.age ? `${record.age} yrs · ` : '';
  const detail = path === '/appointments'
    ? `${String(doctorUser?.name ?? 'Doctor')} · ${String(record.service ?? '')} · ${String(record.startTime ?? '')}`
    : path === '/patients'
      ? `${age}${gender ? `${gender[0].toUpperCase()}${gender.slice(1)} · ` : ''}${String(record.phone ?? '')}`
      : path === '/doctors'
        ? `${String(record.specialization ?? 'Specialist')} · ${String(record.experience ?? 0)} years experience`
        : String(record.detail ?? '');
  const status = path === '/appointments'
    ? String(record.status ?? 'CONFIRMED').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter: string) => letter.toUpperCase())
    : record.isActive === false ? 'Inactive' : String(record.status ?? 'Active');
  const dateValue = record.appointmentDate ?? record.createdAt;
  const date = dateValue ? new Date(String(dateValue)).toLocaleDateString('en-CA') : '';
  const id = String(record._id ?? record.id ?? '');
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const relatedId = (value: unknown) => typeof value === 'object' && value !== null
    ? String((value as ApiRecord)._id ?? (value as ApiRecord).id ?? '')
    : String(value ?? '');
  return {
    id, name, detail, status, date, initials,
    tone: ['mint', 'blue', 'peach', 'lavender'][id.charCodeAt(id.length - 1) % 4] ?? 'mint',
    age: typeof record.age === 'number' ? record.age : undefined,
    gender: typeof record.gender === 'string' ? record.gender : undefined,
    phone: typeof record.phone === 'string'
      ? record.phone
      : typeof patient?.phone === 'string'
        ? patient.phone
        : typeof doctorUser?.phone === 'string' ? doctorUser.phone : undefined,
    email: typeof record.email === 'string' ? record.email : typeof record.userId === 'object' && record.userId !== null && typeof (record.userId as ApiRecord).email === 'string' ? String((record.userId as ApiRecord).email) : undefined,
    patientId: patient ? relatedId(patient) : undefined,
    doctorId: doctor ? relatedId(doctor) : undefined,
    service: typeof record.service === 'string' ? record.service : undefined,
    appointmentDate: dateValue ? new Date(String(dateValue)).toISOString().slice(0, 10) : undefined,
    startTime: typeof record.startTime === 'string' ? record.startTime : undefined,
    endTime: typeof record.endTime === 'string' ? record.endTime : undefined,
  };
};

export const clinicService = {
  async getDashboard(): Promise<DashboardStats> {
    if (demoMode) return demoStats;
    return unwrap<DashboardStats>(await api.get('/dashboard/stats'));
  },
  async getRecords(path: string): Promise<ClinicRecord[]> {
    if (demoMode) return [...(recordsFor(path) ?? [])];
    const apiPath: Record<string, string> = { '/billing': '/invoices' };
    const endpoint = apiPath[path] ?? path;
    const supported = ['/appointments', '/patients', '/doctors', '/invoices', '/prescriptions'];
    if (!supported.includes(endpoint)) throw new Error('Feature coming soon — this API is not available yet.');
    return asRecords(unwrap<unknown>(await api.get(endpoint))).map((record) => displayRecord(record, path));
  },
  async createRecord(path: string, values: CreateRecordInput): Promise<ClinicRecord> {
    if (demoMode) return addDemoRecord(path, values.name, values.detail);
    const apiPath: Record<string, string> = { '/billing': '/invoices' };
    const supported = ['/appointments', '/patients', '/doctors', '/invoices', '/prescriptions'];
    const endpoint = apiPath[path] ?? path;
    if (!supported.includes(endpoint)) throw new Error('Feature coming soon — this API is not available yet.');
    const payload = path === '/patients'
      ? { name: values.name, phone: values.phone, gender: values.gender, age: values.age }
      : path === '/doctors'
        ? values
        : path === '/appointments'
          ? { patientId: values.patientId, doctorId: values.doctorId, service: values.service, appointmentDate: values.appointmentDate, startTime: values.startTime, endTime: values.endTime, notes: values.notes }
          : values;
    const record = unwrap<ApiRecord>(await api.post(endpoint, payload));
    return displayRecord(record, path);
  },
  async updateRecord(path: string, id: string, values: CreateRecordInput): Promise<ClinicRecord> {
    if (demoMode) return updateDemoRecord(path, id, {
      name: values.name,
      detail: values.detail,
      age: values.age,
      gender: values.gender,
      phone: values.phone,
      service: values.service,
      appointmentDate: values.appointmentDate,
      startTime: values.startTime,
      endTime: values.endTime,
    });
    const endpoint = path === '/billing' ? '/invoices' : path;
    if (!['/appointments', '/patients', '/doctors'].includes(endpoint)) {
      throw new Error('Editing is coming soon for this section.');
    }
    const payload = path === '/patients'
      ? { name: values.name, age: values.age, gender: values.gender, phone: values.phone }
      : path === '/doctors'
        ? { name: values.name, phone: values.phone, specialization: values.specialization }
        : { patientId: values.patientId, doctorId: values.doctorId, service: values.service, appointmentDate: values.appointmentDate, startTime: values.startTime, endTime: values.endTime };
    return displayRecord(unwrap<ApiRecord>(await api.put(`${endpoint}/${id}`, payload)), path);
  },
  async deleteRecord(path: string, id: string): Promise<void> {
    if (demoMode) {
      deleteDemoRecord(path, id);
      return;
    }
    if (!['/appointments', '/patients', '/doctors'].includes(path)) {
      throw new Error('Deletion is coming soon for this section.');
    }
    unwrap<{ id: string }>(await api.delete(`${path}/${id}`));
  },
};
