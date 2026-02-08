
try {
    const adminController = require('../controllers/adminController');
    console.log('Keys in adminController:', Object.keys(adminController));
    console.log('createPriceChart type:', typeof adminController.createPriceChart);
    console.log('deletePriceChart type:', typeof adminController.deletePriceChart);
} catch (error) {
    console.error('Error requiring adminController:', error);
}
