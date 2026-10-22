import { Request, Response } from 'express';
import { Patient } from '../models/Patient';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { patientInput } from '../validators/clinic.validator';

const clinicIdFor = (req: Request) => {
  const clinicId = req.user?.clinicId;
  if (!clinicId) throw new AppError('No clinic linked to this account', 403);
  return clinicId;
};

export const listPatients = asyncHandler(async (req: Request, res: Response) => {
  const patients = await Patient.find({ clinicId: clinicIdFor(req) }).sort({ createdAt: -1 }).lean();
  sendSuccess(res, 'Patients', patients);
});

export const getPatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await Patient.findOne({ _id: req.params.id, clinicId: clinicIdFor(req) });
  if (!patient) throw new AppError('Patient not found', 404);
  sendSuccess(res, 'Patient', patient);
});

export const createPatient = asyncHandler(async (req: Request, res: Response) => {
  const input = patientInput.parse(req.body);
  const patient = await Patient.create({ ...input, clinicId: clinicIdFor(req) });
  sendSuccess(res, 'Patient created successfully', patient, 201);
});

export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const input = patientInput.partial().parse(req.body);
  const patient = await Patient.findOneAndUpdate(
    { _id: req.params.id, clinicId: clinicIdFor(req) },
    { $set: input },
    { new: true, runValidators: true },
  );
  if (!patient) throw new AppError('Patient not found', 404);
  sendSuccess(res, 'Patient updated successfully', patient);
});

export const deletePatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await Patient.findOneAndDelete({ _id: req.params.id, clinicId: clinicIdFor(req) });
  if (!patient) throw new AppError('Patient not found', 404);
  sendSuccess(res, 'Patient deleted successfully', { id: patient.id });
});
