export type DashboardStats = {
  todaysAppointments: number;
  completed: number;
  waiting: number;
  cancelled: number;
  noShows: number;
  todaysRevenue: number;
  newPatients: number;
  returningPatients: number;
};

export type ClinicRecord = {
  id: string;
  name: string;
  detail: string;
  date: string;
  status: string;
  amount?: number;
  initials: string;
  tone: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  patientId?: string;
  doctorId?: string;
  service?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
};

export type ClinicUser = {
  name: string;
  email: string;
  role: string;
};
