const mongoose = require('mongoose');

const GpsSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
});


const SensorDataSchema = new mongoose.Schema({
    nodeId: { 
        type: String, 
        required: true, 
        trim: true,
        unique: true, // Ensures only one record per nodeId
        index: true   // Index for faster queries
    },
    current: { 
        type: Number, 
        required: true 
    },
    voltage: { 
        type: Number, 
        required: true 
    },
    relay: { 
        type: String, 
        enum: ['ON', 'OFF', 'FAULT'], 
        required: true 
    },
    timestamp: { 
        type: Date, 
        required: true,
        default: Date.now
    },
   
}, {
    timestamps: false // Don't auto-manage timestamps since we have our own
});
const AuthoritySchema = new mongoose.Schema({

    name: { type: String, required: true },
    number: { type: String, required: true },
    gmail: { type: String, required: true },
    
});

const BreakdownSchema = new mongoose.Schema({
    outNodeId: {
    type: String,
    maxlength: 9
  },
  inNodeId: {
    type: String,
    maxlength: 9
  },
  issueId: {
    type: Number,
   
  }
}, {
    timestamps: true
});
const nodeLocationSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
    unique: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
});


const dataHistorySchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
    maxlength: 9,
    index: true
  },
  current: [{
    type: Number,
    required: true
  }]
}, {
  timestamps: true
});





module.exports = {
    SensorData: mongoose.model('SensorData', SensorDataSchema),
    Authority: mongoose.model('Authority', AuthoritySchema),
    Breakdown_data: mongoose.model('Breakdown_data', BreakdownSchema),
    NodeLocation : mongoose.model('NodeLocation', nodeLocationSchema),
     DataHistory : mongoose.model('DataHistory', dataHistorySchema)
};
