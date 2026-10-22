import { Router } from 'express';
import { createAppointment, deleteAppointment, getAppointment, listAppointments, updateAppointment } from '../controllers/appointment.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();
router.use(authenticateUser);
router.get('/', listAppointments);
router.post('/', authorizeRoles('CLINIC_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST', 'DOCTOR'), createAppointment);
router.get('/:id', getAppointment);
router.put('/:id', authorizeRoles('CLINIC_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST', 'DOCTOR'), updateAppointment);
router.delete('/:id', authorizeRoles('CLINIC_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST'), deleteAppointment);
export default router;
