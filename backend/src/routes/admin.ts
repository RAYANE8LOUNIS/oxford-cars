import { Router, Response } from 'express';
import { query } from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Analytics dashboard
router.get('/analytics', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [totalBookings, revenue, fleetUtil, topVehicles, monthlyStats, customers] = await Promise.all([
      query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'pending') as pending,
             COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
             COUNT(*) FILTER (WHERE status = 'completed') as completed
             FROM reservations`),
      query(`SELECT COALESCE(SUM(total_amount),0) as total,
             COALESCE(SUM(total_amount) FILTER (WHERE created_at >= NOW() - interval '30 days'), 0) as this_month
             FROM reservations WHERE status NOT IN ('cancelled','rejected')`),
      query(`SELECT COUNT(*) FILTER (WHERE is_available = true) as available,
             COUNT(*) as total FROM vehicles`),
      query(`SELECT v.name, v.thumbnail, COUNT(r.id) as rental_count, COALESCE(SUM(r.total_amount),0) as revenue
             FROM vehicles v LEFT JOIN reservations r ON v.id = r.vehicle_id AND r.status NOT IN ('cancelled','rejected')
             GROUP BY v.id ORDER BY rental_count DESC LIMIT 5`),
      query(`SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as bookings, COALESCE(SUM(total_amount),0) as revenue
             FROM reservations WHERE status NOT IN ('cancelled','rejected') AND created_at >= NOW() - interval '12 months'
             GROUP BY month ORDER BY month ASC`),
      query(`SELECT COUNT(*) as total FROM users WHERE role = 'customer'`),
    ]);

    res.json({
      bookings: totalBookings.rows[0],
      revenue: revenue.rows[0],
      fleet: fleetUtil.rows[0],
      topVehicles: topVehicles.rows,
      monthlyStats: monthlyStats.rows,
      customers: customers.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get all customers
router.get('/customers', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  try {
    const result = await query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.city, u.created_at,
       COUNT(r.id) as total_rentals, COALESCE(SUM(r.total_amount),0) as total_spent
       FROM users u
       LEFT JOIN reservations r ON u.id = r.user_id AND r.status NOT IN ('cancelled','rejected')
       WHERE u.role = 'customer'
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const count = await query(`SELECT COUNT(*) FROM users WHERE role = 'customer'`);
    res.json({ customers: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get all reviews (admin)
router.get('/reviews', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT r.*, u.first_name, u.last_name, v.name as vehicle_name
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN vehicles v ON r.vehicle_id = v.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Approve/reject review
router.put('/reviews/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { is_approved } = req.body;
  try {
    const result = await query(
      'UPDATE reviews SET is_approved = $1 WHERE id = $2 RETURNING *',
      [is_approved, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Get contact messages
router.get('/messages', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark message as read
router.put('/messages/:id/read', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await query('UPDATE contact_messages SET is_read = true WHERE id = $1', [req.params.id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update message' });
  }
});

export default router;
