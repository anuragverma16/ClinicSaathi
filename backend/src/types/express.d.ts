import { Types } from 'mongoose';
import { Role } from '../utils/constants';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role; clinicId?: Types.ObjectId; branchId?: Types.ObjectId };
    }
  }
}
export {};
