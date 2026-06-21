import { Router, Request, Response } from 'express';
import { NotificationsService } from '../services/notifications.service.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/roles.js';

const router = Router();
const service = new NotificationsService();

router.use(authenticate);

router.get('/', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.findByUser(req.user!.id);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/unread-count', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.unreadCount(req.user!.id);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/read-all', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    await service.markAllRead(req.user!.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/:id/read', requireRoles('admin', 'manager', 'employee'), async (req: Request, res: Response) => {
  try {
    const result = await service.markRead(req.params.id, req.user!.id);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
