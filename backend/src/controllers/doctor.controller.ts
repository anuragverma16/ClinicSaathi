import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { doctorInput, doctorUpdateInput } from '../validators/clinic.validator';

const clinicIdFor = (req: Request) => {
  const clinicId = req.user?.clinicId;
  if (!clinicId) throw new AppError('No clinic linked to this account', 403);
  return clinicId;
};

export const listDoctors = asyncHandler(async (req: Request, res: Response) => {
  const doctors = await Doctor.find({ clinicId: clinicIdFor(req) })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 })
    .lean();
  sendSuccess(res, 'Doctors', doctors);
});

export const getDoctor = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await Doctor.findOne({ _id: req.params.id, clinicId: clinicIdFor(req) }).populate('userId', 'name email phone');
  if (!doctor) throw new AppError('Doctor not found', 404);
  sendSuccess(res, 'Doctor', doctor);
});

export const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const input = doctorInput.parse(req.body);
  const clinicId = clinicIdFor(req);
  const user = await User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    password: input.password,
    role: 'DOCTOR',
    clinicId,
  });

  try {
    const doctor = await Doctor.create({
      userId: user._id,
      clinicId,
      specialization: input.specialization,
      qualification: input.qualification,
      consultationFee: input.consultationFee,
      experience: input.experience,
    });
    await doctor.populate('userId', 'name email phone');
    sendSuccess(res, 'Doctor created successfully', doctor, 201);
  } catch (error) {
    await User.deleteOne({ _id: user._id, clinicId });
    throw error;
  }
});

export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const input = doctorUpdateInput.parse(req.body);
  const doctor = await Doctor.findOneAndUpdate(
    { _id: req.params.id, clinicId: clinicIdFor(req) },
    { $set: input },
    { new: true, runValidators: true },
  ).populate('userId', 'name email phone');
  if (!doctor) throw new AppError('Doctor not found', 404);
  if (input.name || input.phone) {
    const populatedUser = doctor.populated('userId')
      ? doctor.get('userId') as { _id?: Types.ObjectId }
      : undefined;
    const userId = populatedUser?._id ?? doctor.userId;
    const userUpdates = {
      ...(input.name ? { name: input.name } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
    };
    await User.updateOne({ _id: userId, clinicId: clinicIdFor(req) }, { $set: userUpdates });
  }
  const refreshedDoctor = await Doctor.findById(doctor.id).populate('userId', 'name email phone');
  sendSuccess(res, 'Doctor updated successfully', refreshedDoctor);
});

export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const doctor = await Doctor.findOneAndDelete({ _id: req.params.id, clinicId: clinicIdFor(req) });
  if (!doctor) throw new AppError('Doctor not found', 404);
  await User.deleteOne({ _id: doctor.userId, clinicId: clinicIdFor(req), role: 'DOCTOR' });
  sendSuccess(res, 'Doctor deleted successfully', { id: doctor.id });
});
