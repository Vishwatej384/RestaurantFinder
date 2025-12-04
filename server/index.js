
// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// lowdb setup
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

// helper: filter local restaurants by distance (meters)
function filterLocalByRadius(restaurants, lat, lng, radiusMeters) {
  if (!lat || !lng) return restaurants || [];
  const R = 6371e3; // metres
  const toRad = (x) => (x * Math.PI) / 180;
  return (restaurants || []).filter((r) => {
    if (!r.latitude || !r.longitude) return false;
    const φ1 = toRad(Number(lat));
    const φ2 = toRad(Number(r.latitude));
    const Δφ = toRad(Number(r.latitude) - Number(lat));
    const Δλ = toRad(Number(r.longitude) - Number(lng));
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // meters
    return d <= Number(radiusMeters || 5000);
  });
}

async function initDbAndStart() {
  try {
    await db.read();
    db.data = db.data || { restaurants: [] };
    await db.write();

    // --------- Local Restaurants CRUD ------------
    app.get('/api/restaurants', async (req, res) => {
      await db.read();
      res.json(db.data.restaurants);
    });

    app.get('/api/restaurants/:id', async (req, res) => {
      await db.read();
      const r = db.data.restaurants.find((x) => x.id === req.params.id);
      if (!r) return res.status(404).json({ error: 'Not found' });
      res.json(r);
    });

    app.post('/api/restaurants', async (req, res) => {
      const { name, category, latitude, longitude, rating, price_range, isVeg, opening_hours } = req.body;
      if (!name || latitude == null || longitude == null) return res.status(400).json({ error: 'name, latitude and longitude required' });
      const newR = {
        id: nanoid(8),
        name,
        category: category || 'Unknown',
        rating: rating || 0,
        price_range: price_range || 1,
        isVeg: !!isVeg,
        latitude: Number(latitude),
        longitude: Number(longitude),
        images: [],
        opening_hours: opening_hours || '',
        createdAt: new Date().toISOString()
      };
      await db.read();
      db.data.restaurants.push(newR);
      await db.write();
      res.status(201).json(newR);
    });

    app.delete('/api/restaurants/:id', async (req, res) => {
      await db.read();
      const before = db.data.restaurants.length;
      db.data.restaurants = db.data.restaurants.filter((r) => r.id !== req.params.id);
      await db.write();
      res.json({ ok: true, removed: before - db.data.restaurants.length });
    });

    // --------- External Places API proxy (search) ------------
    app.get('/api/search', async (req, res) => {
      const { query = '', lat, lng, limit = 10, radius = process.env.DEFAULT_RADIUS || 5000 } = req.query;
      try {
        if (!process.env.PLACES_API_KEY || !process.env.PLACES_API_URL) {
          // fallback: return only local restaurants (optionally filtered by radius)
          await db.read();
          const localNearby = filterLocalByRadius(db.data.restaurants, lat, lng, radius);
          return res.json({ external: null, local: localNearby });
        }

        const headers = { Authorization: process.env.PLACES_API_KEY, Accept: 'application/json' };
        const params = {
          query,
          ll: lat && lng ? `${lat},${lng}` : undefined,
          radius: Number(radius),
          limit: Number(limit)
        };
        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

        const resp = await axios.get(process.env.PLACES_API_URL, { params, headers });
        await db.read();
        const localNearby = filterLocalByRadius(db.data.restaurants, lat, lng, radius);
        res.json({ external: resp.data, local: localNearby });
      } catch (err) {
        console.error('search error', err.message || err);
        res.status(500).json({ error: 'External API error', details: err.message || err.toString() });
      }
    });

    // --------- Mapbox Directions proxy ------------
    app.get('/api/directions', async (req, res) => {
      try {
        const { fromLng, fromLat, toLng, toLat } = req.query;
        if (!fromLng || !fromLat || !toLng || !toLat) return res.status(400).json({ error: 'missing coordinates' });
        const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLng},${fromLat};${toLng},${toLat}`;
        const resp = await axios.get(mapboxUrl, {
          params: { geometries: 'geojson', access_token: process.env.MAPBOX_TOKEN, overview: 'full' }
        });
        res.json(resp.data);
      } catch (err) {
        console.error('directions error', err.message || err);
        res.status(500).json({ error: 'directions error', details: err.message || err.toString() });
      }
    });

    // health
    app.get('/api/health', (req, res) => res.json({ ok: true }));

    // now start listening
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Failed to init DB or start server', err);
    process.exit(1);
  }
}

initDbAndStart();
