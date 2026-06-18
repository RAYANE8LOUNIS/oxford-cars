import { Router, Response } from 'express';
import { query } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { vehicle_id, reservation_id, rating, title, content } = req.body;
  if (!vehicle_id || !rating) return res.status(400).json({ error: 'Vehicle and rating required' });

  try {
    // Verify the user rented this vehicle
    if (reservation_id) {
      const resCheck = await query(
        `SELECT id FROM reservations WHERE id=$1 AND user_id=$2 AND vehicle_id=$3 AND status='completed'`,
        [reservation_id, req.user!.id, vehicle_id]
      );
      if (!resCheck.rows[0]) return res.status(403).json({ error: 'You can only review vehicles you have rented' });
    }

    const result = await query(
      'INSERT INTO reviews (user_id, vehicle_id, reservation_id, rating, title, content) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.user!.id, vehicle_id, reservation_id || null, rating, title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
