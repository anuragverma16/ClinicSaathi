import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { Invoice } from '../models/Invoice';
import { Patient } from '../models/Patient';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const clinicId = req.user?.clinicId;
  if (!clinicId) throw new AppError('No clinic linked to this account', 400);

  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  const today = { $gte: start, $lt: end };

  const [byStatus, revenue, newPatients, todaysPatientIds] = await Promise.all([
    Appointment.aggregate([
      { $match: { clinicId, appointmentDate: today } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Invoice.aggregate([
      { $match: { clinicId, paymentStatus: 'PAID', paidAt: today } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Patient.countDocuments({ clinicId, createdAt: today }),
    Appointment.distinct('patientId', { clinicId, appointmentDate: today }),
  ]);

  // Returning = patients with an appointment today AND an earlier one
  const returningPatients = todaysPatientIds.length
    ? (await Appointment.distinct('patientId', {
        clinicId, patientId: { $in: todaysPatientIds }, appointmentDate: { $lt: start },
      })).length
    : 0;

  const count = (s: string) => byStatus.find((b) => b._id === s)?.count ?? 0;
  const totalToday = byStatus.reduce((n, b) => n + b.count, 0);

  sendSuccess(res, 'Dashboard stats', {
    todaysAppointments: totalToday,
    completed: count('COMPLETED'),
    waiting: count('WAITING'),
    cancelled: count('CANCELLED'),
    noShows: count('NO_SHOW'),
    todaysRevenue: revenue[0]?.total ?? 0,
    newPatients,
    returningPatients,
  });
});
