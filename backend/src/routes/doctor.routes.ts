import { Router } from 'express';
import { createDoctor, deleteDoctor, getDoctor, listDoctors, updateDoctor } from '../controllers/doctor.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';

const router = Router();
router.use(authenticateUser);
router.get('/', listDoctors);
router.post('/', authorizeRoles('CLINIC_OWNER', 'BRANCH_MANAGER'), createDoctor);
router.get('/:id', getDoctor);
router.put('/:id', authorizeRoles('CLINIC_OWNER', 'BRANCH_MANAGER'), updateDoctor);
router.delete('/:id', authorizeRoles('CLINIC_OWNER', 'BRANCH_MANAGER'), deleteDoctor);
export default router;
