const mongoose = require('mongoose');
// schema in the database
const CubeSchema = new mongoose.Schema({
  cubeId: { type: String, unique: true, default: 'cube_1' },
  position: {
    x: Number,
    y: Number,
    z: Number
  },
  rotationSpeed: Number,
  lastSaved: Date,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cube', CubeSchema);
