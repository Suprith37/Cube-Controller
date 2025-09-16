const express = require('express');
const router = express.Router();
const Cube = require('../models/Cube');

const BASE_URL = "https://cube-controller.vercel.app/"

// GET cube data by ID (if not found, create default)
router.get('${BASE_URL}/:id', async (req, res) => {
  try {
    const cube = await Cube.findOne({ cubeId: req.params.id });
    
    // If cube not found, create with default values
    if (!cube) {
      const defaultCube = await Cube.create({
        cubeId: req.params.id,
        position: { x: 0, y: 0, z: 0 },
        rotationSpeed: 0.01,
        lastSaved: new Date()
      });
      return res.json(defaultCube);
    }

    // Send found cube
    res.json(cube);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('${BASE_URL}/:id/save', async (req, res) => {
  try {
    const cubeId = req.params.id;
    const { position, rotationSpeed } = req.body;

    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number' || typeof position.z !== 'number') {
      return res.status(400).json({ error: 'Invalid position data' });
    }

    // Step 1: update cube data and updatedAt
    let cube = await Cube.findOne({ cubeId });

    if (!cube) {
      cube = new Cube({
        cubeId,
        position,
        rotationSpeed,
        updatedAt: new Date()
      });
      await cube.save();
    } else {
      cube.position = position;
      cube.rotationSpeed = rotationSpeed;
      cube.updatedAt = new Date();
      await cube.save();
    }

    // ✅ Step 2: only after successful save → update lastSaved
    cube.lastSaved = new Date();
    // await cube.save();

    const obj = cube.toObject();
    obj.lastSavedLocal = cube.lastSaved
      ? cube.lastSaved.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : null;
    obj.updatedAtLocal = cube.updatedAt
      ? cube.updatedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : null;

    //   console.log("ojs: "+obj.lastSaved)
    // res.json(obj);
    console.log("Cube saved successfully, lastSaved updated:", cube);

  } catch (err) {
    console.error('Error saving cube:', err);
    res.status(500).json({ error: err.message });
  }
});


// Reset cube to default position and speed
router.post('${BASE_URL}/:id/reset', async (req, res) => {
  try {
    const defaultData = {
      position: { x: 0, y: 0, z: 0 },
      rotationSpeed: 0.01,
      lastSaved: new Date(),
      updatedAt: new Date()
    };

    const cube = await Cube.findOneAndUpdate(
      { cubeId: req.params.id },
      defaultData,
      { new: true, upsert: true }
    );

    res.json(cube);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
