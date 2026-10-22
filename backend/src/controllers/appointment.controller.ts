import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { appointmentInput, appointmentUpdateInput } from '../validators/clinic.validator';

const clinicIdFor = (req: Request) => {
  const clinicId = req.user?.clinicId;
  if (!clinicId) throw new AppError('No clinic linked to this account', 403);
  return clinicId;
};

const populatedAppointment = () => [
  { path: 'patientId', select: 'name phone age gender' },
  { path: 'doctorId', select: 'specialization userId', populate: { path: 'userId', select: 'name' } },
];

export const listAppointments = asyncHandler(async (req: Request, res: Response) => {
  const appointments = await Appointment.find({ clinicId: clinicIdFor(req) })
    .populate(populatedAppointment())
    .sort({ appointmentDate: -1, startTime: 1 })
    .lean();
  sendSuccess(res, 'Appointments', appointments);
});

export const getAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, clinicId: clinicIdFor(req) })
    .populate(populatedAppointment());
  if (!appointment) throw new AppError('Appointment not found', 404);
  sendSuccess(res, 'Appointment', appointment);
});

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const input = appointmentInput.parse(req.body);
  const clinicId = clinicIdFor(req);
  const [patient, doctor] = await Promise.all([
    Patient.exists({ _id: input.patientId, clinicId }),
    Doctor.exists({ _id: input.doctorId, clinicId, isActive: true }),
  ]);
  if (!patient) throw new AppError('Patient not found in this clinic', 404);
  if (!doctor) throw new AppError('Active doctor not found in this clinic', 404);
  const appointment = await Appointment.create({ ...input, clinicId });
  await appointment.populate(populatedAppointment());
  sendSuccess(res, 'Appointment created successfully', appointment, 201);
});

export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const input = appointmentUpdateInput.parse(req.body);
  const clinicId = clinicIdFor(req);
  if (input.patientId && !await Patient.exists({ _id: input.patientId, clinicId })) {
    throw new AppError('Patient not found in this clinic', 404);
  }
  if (input.doctorId && !await Doctor.exists({ _id: input.doctorId, clinicId, isActive: true })) {
    throw new AppError('Active doctor not found in this clinic', 404);
  }
  const appointment = await Appointment.findOneAndUpdate(
    { _id: req.params.id, clinicId },
    { $set: input },
    { new: true, runValidators: true },
  ).populate(populatedAppointment());
  if (!appointment) throw new AppError('Appointment not found', 404);
  sendSuccess(res, 'Appointment updated successfully', appointment);
});

export const deleteAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, clinicId: clinicIdFor(req) });
  if (!appointment) throw new AppError('Appointment not found', 404);
  sendSuccess(res, 'Appointment deleted successfully', { id: appointment.id });
});
