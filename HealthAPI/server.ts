import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'HealthApp API is running ✅' });
});

app.get('/api/stats', async (req, res) => {
  try {
    const [appts, patients, doctors, revenue] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM appointments`),
      pool.query(`SELECT COUNT(*) FROM patients`),
      pool.query(`SELECT COUNT(*) FROM doctors WHERE available = true`),
      pool.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM revenue`),
    ]);
    res.json({
      totalAppointments: Number(appts.rows[0].count),
      totalPatients:     Number(patients.rows[0].count),
      activeDoctors:     Number(doctors.rows[0].count),
      totalRevenue:      Number(revenue.rows[0].total),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    const { date_from, date_to, status } = req.query;
    let query = `
      SELECT
        a.id,
        a.appointment_date::text,
        a.appointment_time::text,
        a.status,
        p.name AS patient_name,
        d.name AS doctor_name,
        d.specialty
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors  d ON a.doctor_id  = d.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (date_from) { params.push(date_from); query += ` AND a.appointment_date >= $${params.length}`; }
    if (date_to)   { params.push(date_to);   query += ` AND a.appointment_date <= $${params.length}`; }
    if (status)    { params.push(status);    query += ` AND a.status = $${params.length}`; }
    query += ` ORDER BY a.appointment_date DESC, a.appointment_time ASC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/doctors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        d.id, d.name, d.specialty, d.rating, d.available,
        COUNT(a.id) AS total_patients
      FROM doctors d
      LEFT JOIN appointments a ON d.id = a.doctor_id
      GROUP BY d.id
      ORDER BY d.rating DESC
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, phone, date_of_birth::text, blood_group, created_at::text
      FROM patients ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/revenue', async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    let query = `
      SELECT
        TO_CHAR(payment_date, 'Mon')     AS month,
        EXTRACT(MONTH FROM payment_date) AS month_num,
        EXTRACT(YEAR  FROM payment_date) AS year,
        SUM(CASE WHEN service_type = 'nursing'  THEN amount ELSE 0 END) AS nursing,
        SUM(CASE WHEN service_type = 'pharmacy' THEN amount ELSE 0 END) AS pharmacy,
        SUM(CASE WHEN service_type = 'homecare' THEN amount ELSE 0 END) AS homecare,
        SUM(amount) AS total
      FROM revenue WHERE 1=1
    `;
    const params: any[] = [];
    if (date_from) { params.push(date_from); query += ` AND payment_date >= $${params.length}`; }
    if (date_to)   { params.push(date_to);   query += ` AND payment_date <= $${params.length}`; }
    query += ` GROUP BY month, month_num, year ORDER BY year, month_num`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/revenue/daily', async (req, res) => {
  try {
    const { year, month } = req.query;
    const result = await pool.query(`
      SELECT
        payment_date::text AS date,
        SUM(amount) AS total,
        SUM(CASE WHEN service_type = 'nursing'  THEN amount ELSE 0 END) AS nursing,
        SUM(CASE WHEN service_type = 'pharmacy' THEN amount ELSE 0 END) AS pharmacy,
        SUM(CASE WHEN service_type = 'homecare' THEN amount ELSE 0 END) AS homecare
      FROM revenue
      WHERE EXTRACT(YEAR  FROM payment_date) = $1
        AND EXTRACT(MONTH FROM payment_date) = $2
      GROUP BY payment_date ORDER BY payment_date
    `, [year, month]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});