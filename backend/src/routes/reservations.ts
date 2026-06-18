import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticate, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth';
import { sendReservationConfirmation, sendAdminNotification } from '../utils/email';

const router = Router();

// Check vehicle availability
router.post('/check-availability', async (req: Request, res: Response) => {
  const { vehicle_id, pickup_date, return_date } = req.body;
  try {
    const conflict = await query(
      `SELECT id FROM reservations
       WHERE vehicle_id = $1 AND status NOT IN ('cancelled','rejected')
       AND NOT (return_date <= $2 OR pickup_date >= $3)`,
      [vehicle_id, pickup_date, return_date]
    );
    res.json({ available: conflict.rows.length === 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

// Create reservation
router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  const {
    vehicle_id, pickup_date, return_date, pickup_location, return_location,
    guest_name, guest_email, guest_phone, notes
  } = req.body;

  try {
    // Check availability
    const conflict = await query(
      `SELECT id FROM reservations
       WHERE vehicle_id = $1 AND status NOT IN ('cancelled','rejected')
       AND NOT (return_date <= $2 OR pickup_date >= $3)`,
      [vehicle_id, pickup_date, return_date]
    );
    if (conflict.rows.length > 0) return res.status(409).json({ error: 'Vehicle not available for selected dates' });

    // Get vehicle pricing
    const vResult = await query('SELECT * FROM vehicles WHERE id = $1 AND is_available = true', [vehicle_id]);
    if (!vResult.rows[0]) return res.status(404).json({ error: 'Vehicle not found or unavailable' });
    const vehicle = vResult.rows[0];

    const pickup = new Date(pickup_date);
    const returnD = new Date(return_date);
    const totalDays = Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
    if (totalDays < 1) return res.status(400).json({ error: 'Invalid dates' });

    let dailyRate = vehicle.daily_price;
    if (totalDays >= 7 && vehicle.weekly_price) dailyRate = vehicle.weekly_price / 7;

    const subtotal = dailyRate * totalDays;
    const taxAmount = 0; // Can configure TAX
    const depositAmount = vehicle.deposit_amount || 0;
    const totalAmount = subtotal + taxAmount;

    const result = await query(
      `INSERT INTO reservations (user_id, vehicle_id, pickup_date, return_date, pickup_location, return_location, total_days, daily_rate, subtotal, tax_amount, deposit_amount, total_amount, guest_name, guest_email, guest_phone, notes, reservation_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'')
       RETURNING *`,
      [req.user?.id || null, vehicle_id, pickup_date, return_date, pickup_location, return_location, totalDays, dailyRate, subtotal, taxAmount, depositAmount, totalAmount, guest_name, guest_email, guest_phone, notes]
    );

    const reservation = result.rows[0];

    // Send emails asynchronously (don't block the response)
    const emailTo = guest_email || (req.user?.id ? (await query('SELECT email FROM users WHERE id=$1', [req.user.id])).rows[0]?.email : null);
    const clientName = guest_name || (req.user?.id ? `${(await query('SELECT first_name,last_name FROM users WHERE id=$1',[req.user.id])).rows[0]?.first_name}` : 'Client');
    const clientPhone = guest_phone || (req.user?.id ? (await query('SELECT phone FROM users WHERE id=$1',[req.user.id])).rows[0]?.phone : '');

    if (emailTo) {
      sendReservationConfirmation({
        to: emailTo,
        guest_name: clientName,
        reservation_number: reservation.reservation_number,
        vehicle_name: vehicle.name,
        pickup_date: pickup_date,
        return_date: return_date,
        pickup_location,
        return_location: return_location || pickup_location,
        total_days: totalDays,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
      });
    }

    sendAdminNotification({
      reservation_number: reservation.reservation_number,
      guest_name: clientName,
      guest_phone: clientPhone || '',
      guest_email: emailTo || '',
      vehicle_name: vehicle.name,
      pickup_date,
      return_date,
      pickup_location,
      total_days: totalDays,
      total_amount: totalAmount,
    });

    res.status(201).json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// Get user's own reservations
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT r.*, v.name as vehicle_name, v.thumbnail as vehicle_image, v.brand, v.model, v.year
       FROM reservations r
       LEFT JOIN vehicles v ON r.vehicle_id = v.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Get single reservation
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT r.*, v.name as vehicle_name, v.thumbnail as vehicle_image, v.brand, v.model, v.year, v.daily_price
       FROM reservations r
       LEFT JOIN vehicles v ON r.vehicle_id = v.id
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Reservation not found' });

    const reservation = result.rows[0];
    if (req.user!.role === 'customer' && reservation.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
});

// Cancel reservation (customer)
router.put('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `UPDATE reservations SET status = 'cancelled'
       WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'confirmed')
       RETURNING *`,
      [req.params.id, req.user!.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Reservation not found or cannot be cancelled' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

// Admin: get all reservations
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  let q = `SELECT r.*, v.name as vehicle_name, v.thumbnail as vehicle_image,
            u.first_name, u.last_name, u.email as user_email, u.phone as user_phone
            FROM reservations r
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE 1=1`;
  const params: unknown[] = [];
  let idx = 1;
  if (status) { q += ` AND r.status = $${idx++}`; params.push(status); }
  q += ` ORDER BY r.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);

  try {
    const result = await query(q, params);
    const countResult = await query('SELECT COUNT(*) FROM reservations' + (status ? ` WHERE status = '${status}'` : ''));
    res.json({ reservations: result.rows, total: parseInt(countResult.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Admin: update reservation status
router.put('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { status, admin_notes } = req.body;
  try {
    const result = await query(
      'UPDATE reservations SET status=$1, admin_notes=$2 WHERE id=$3 RETURNING *',
      [status, admin_notes, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Reservation not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
