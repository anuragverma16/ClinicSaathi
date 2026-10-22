import { Router } from 'express';
import { createPatient, deletePatient, getPatient, listPatients, updatePatient } from '../controllers/patient.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();
router.use(authenticateUser);
router.get('/', listPatients);
router.post('/', authorizeRoles('CLINIC_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST', 'DOCTOR'), createPatient);
router.get('/:id', getPatient);
router.put('/:id', authorizeRoles('CLINIC_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST', 'DOCTOR'), updatePatient);
router.delete('/:id', authorizeRoles('CLINIC_OWNER', 'BRANCH_MANAGER'), deletePatient);
export default router;
