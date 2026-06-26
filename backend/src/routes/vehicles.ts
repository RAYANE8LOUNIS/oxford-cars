import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'oxford-cars/vehicles', public_id: filename, overwrite: true },
      (err, result) => {
        if (err || !result) return reject(err);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// GET all vehicles (with filters)
router.get('/', async (req: Request, res: Response) => {
  const { category, transmission, available, search, featured } = req.query;
  let q = 'SELECT * FROM vehicles WHERE 1=1';
  const params: unknown[] = [];
  let idx = 1;

  if (category) { q += ` AND category = $${idx++}`; params.push(category); }
  if (transmission) { q += ` AND transmission = $${idx++}`; params.push(transmission); }
  if (available === 'true') { q += ` AND is_available = true`; }
  if (featured === 'true') { q += ` AND is_featured = true`; }
  if (search) { q += ` AND (name ILIKE $${idx} OR brand ILIKE $${idx} OR model ILIKE $${idx})`; params.push(`%${search}%`); idx++; }
  q += ' ORDER BY is_featured DESC, created_at DESC';

  try {
    const result = await query(q, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// GET single vehicle
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Vehicle not found' });

    const reviews = await query(
      `SELECT r.*, u.first_name, u.last_name FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.vehicle_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC LIMIT 10`,
      [req.params.id]
    );

    res.json({ ...result.rows[0], reviews: reviews.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// GET vehicle availability
router.get('/:id/availability', async (req: Request, res: Response) => {
  const { month, year } = req.query;
  try {
    const result = await query(
      `SELECT pickup_date, return_date FROM reservations
       WHERE vehicle_id = $1 AND status NOT IN ('cancelled', 'rejected')
       AND (
         (EXTRACT(MONTH FROM pickup_date) = $2 AND EXTRACT(YEAR FROM pickup_date) = $3)
         OR (EXTRACT(MONTH FROM return_date) = $2 AND EXTRACT(YEAR FROM return_date) = $3)
         OR (pickup_date <= make_date($3::int, $2::int, 1) AND return_date >= (make_date($3::int, $2::int, 1) + interval '1 month')::date)
       )`,
      [req.params.id, month || new Date().getMonth() + 1, year || new Date().getFullYear()]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// POST create vehicle (admin)
router.post('/', authenticate, requireAdmin, upload.array('images', 10), async (req: AuthRequest, res: Response) => {
  const {
    name, brand, model, year, category, transmission, fuel_type,
    seats, doors, color, license_plate, daily_price, weekly_price,
    monthly_price, deposit_amount, description, features, is_featured
  } = req.body;

  const files = req.files as Express.Multer.File[];
  const featuresArray = features ? (Array.isArray(features) ? features : features.split(',').map((f: string) => f.trim())) : [];

  try {
    let images: string[] = [];
    if (files?.length) {
      images = await Promise.all(
        files.map(f => uploadToCloudinary(f.buffer, `vehicle-${Date.now()}-${Math.random().toString(36).slice(2)}`))
      );
    }
    const thumbnail = images[0] || null;

    const result = await query(
      `INSERT INTO vehicles (name, brand, model, year, category, transmission, fuel_type, seats, doors, color, license_plate, daily_price, weekly_price, monthly_price, deposit_amount, description, features, images, thumbnail, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING *`,
      [name, brand, model, year, category, transmission, fuel_type, seats || 5, doors || 4, color, license_plate, daily_price, weekly_price, monthly_price, deposit_amount || 0, description, featuresArray, images, thumbnail, is_featured === 'true']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// PUT update vehicle (admin)
router.put('/:id', authenticate, requireAdmin, upload.array('images', 10), async (req: AuthRequest, res: Response) => {
  const {
    name, brand, model, year, category, transmission, fuel_type,
    seats, doors, color, daily_price, weekly_price, monthly_price,
    deposit_amount, description, features, is_available, is_featured, existing_images
  } = req.body;

  const files = req.files as Express.Multer.File[];
  const featuresArray = features ? (Array.isArray(features) ? features : features.split(',').map((f: string) => f.trim())) : [];
  const existingImgs = existing_images ? (Array.isArray(existing_images) ? existing_images : [existing_images]) : [];

  try {
    let newImages: string[] = [];
    if (files?.length) {
      newImages = await Promise.all(
        files.map(f => uploadToCloudinary(f.buffer, `vehicle-${Date.now()}-${Math.random().toString(36).slice(2)}`))
      );
    }
    const allImages = [...existingImgs, ...newImages];
    const thumbnail = allImages[0] || null;

    const result = await query(
      `UPDATE vehicles SET name=$1,brand=$2,model=$3,year=$4,category=$5,transmission=$6,fuel_type=$7,seats=$8,doors=$9,color=$10,daily_price=$11,weekly_price=$12,monthly_price=$13,deposit_amount=$14,description=$15,features=$16,images=$17,thumbnail=$18,is_available=$19,is_featured=$20
       WHERE id=$21 RETURNING *`,
      [name, brand, model, year, category, transmission, fuel_type, seats, doors, color, daily_price, weekly_price, monthly_price, deposit_amount, description, featuresArray, allImages, thumbnail, is_available !== 'false', is_featured === 'true', req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// DELETE vehicle (admin)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await query('DELETE FROM vehicles WHERE id = $1', [req.params.id]);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;
