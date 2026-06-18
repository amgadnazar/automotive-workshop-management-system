import express from 'express';
import {
getWorkshopInfo,
updateWorkshopInfo
} from '../controllers/workshopController.js';

const router = express.Router();

router.get('/', getWorkshopInfo);
router.put('/', updateWorkshopInfo);

export default router;
