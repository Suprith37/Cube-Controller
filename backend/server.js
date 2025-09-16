const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config(); // Load environment variables
const app = express();

app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON data

const cubeRoutes = require('./routes/cubeRoutes');
app.use('/api/cubes', cubeRoutes)
app.use(express.static('../frontend')); // Serve static frontend files

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'));

// Use cube-related API routes
app.use('/api/cubes', cubeRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
