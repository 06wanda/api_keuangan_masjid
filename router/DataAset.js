// router/DataAset.js
const express = require('express');
const controller = require('../controller/DataAset');
const router = express.Router();

// Route Aset
router.post('/input', controller.inputAset);
router.get('/get-data', controller.getDataAset);
router.get('/get-data/:id', controller.getDataAsetById);
router.delete('/delete-aset/:id', controller.hapusAset);
router.put('/update-aset/:id', controller.updateAset);

router.post('/input-aset-lama', controller.inputAsetLama);
router.get('/get-data-aset-lama', controller.getDataAsetLama);
router.get('/get-data-aset-lama/:id', controller.getDataAsetLamaById);
router.delete('/delete-aset-aset-lama/:id', controller.hapusAsetLama);
router.put('/update-aset-lama/:id', controller.updateAsetLama);

module.exports = router;
