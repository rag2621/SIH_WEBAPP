// routes/api.routes.js
const express = require('express');
const router = express.Router();
const {SensorData, NodeLocation,Breakdown_data,DataHistory} = require('../modals/sensorModal');

// --- POST Endpoint to receive data from Gateway ---
// URL: POST /api/data
router.post('/data', async (req, res) => {
    try {
        console.log('Received data via HTTP POST:', req.body);
        const newData = new SensorData(req.body);
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (error) {
        console.error("Error saving data:", error);
        res.status(400).json({ message: 'Invalid data format', error: error.message });
    }
});

// --- GET Endpoint for the Frontend to fetch data ---
// URL: GET /api/data?limit=10
router.get('/data', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20; // Default to 20 latest entries
        const data = await SensorData.find()
            .sort({ timestamp: -1 }) // Get the most recent data first
            .limit(limit);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
});

// historical data 
router.post('/data', async (req, res) => {
    try {
        const data = req.body;

        // Check if the incoming data is an array (for batch history)
        if (Array.isArray(data)) {
            console.log(`Received a batch of ${data.length} historical records.`);
            // Use insertMany for efficient bulk insertion
            const savedData = await SensorData.insertMany(data);
            res.status(201).json({ message: 'Successfully saved batch data', count: savedData.length });
        
        } else { // Handle a single real-time data object
            console.log('Received a single real-time record.');
            const newData = new SensorData(data);
            const savedData = await newData.save();
            res.status(201).json(savedData);
        }

    } catch (error) {
        console.error("Error saving data:", error);
        res.status(400).json({ message: 'Invalid data format', error: error.message });
    }
});

//get request 
// routes/api.routes.js

// ... (your existing POST and GET routes)

// --- GET Endpoint for a single node's history ---
// URL: GET /api/data/history/:nodeId
router.get('/data/history/:nodeId', async (req, res) => {
    try {
        const { nodeId } = req.params;

        // Calculate the date 24 hours ago from now
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const history = await SensorData.find({
            node_id: nodeId,
            timestamp: { $gte: twentyFourHoursAgo } // Get data from the last 24 hours
        }).sort({ timestamp: 'asc' }); // Sort by time ascending

        if (!history) {
            return res.status(404).json({ message: 'No historical data found for this node.' });
        }

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching historical data', error: error.message });
    }
});



router.get('/location/:nodeId', async (req, res) => {
    try {
        const { nodeId } = req.params;
        const data = await NodeLocation.findOne({ nodeId: nodeId });
        
        if (!data) {
            return res.status(404).json({ 
                success: false,
                message: 'Location not found for this node' 
            });
        }
        
        res.json({
            success: true,
            data: data
        });
        
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
});

router.get('/alerts', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50; // Default to 50 latest alerts
        const nodeId = req.query.nodeId; // Optional filter by nodeId
        
        // Build query filter
        let filter = {};
        if (nodeId) {
            filter = {
                $or: [
                    { outNodeID: nodeId },
                    { inNodeID: nodeId }
                ]
            };
        }
        
        const alerts = await Breakdown_data.find(filter)
            .sort({ createdAt: -1 }) // Most recent first
            .limit(limit);
        
        res.status(200).json(alerts);
        
    } catch (error) {
        console.error('Error fetching breakdown alerts:', error);
        res.status(500).json({ 
            message: 'Error fetching breakdown alerts', 
            error: error.message 
        });
    }
});

router.get('/data/history/:nodeId', async(req,res)=>{

    const d=await DataHistory.find({nodeId:req.params.nodeId}).sort({createdAt:-1}).limit(1);

} 
   
)
module.exports = router;
