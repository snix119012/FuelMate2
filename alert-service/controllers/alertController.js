const { Op } = require('sequelize');
const axios = require('axios');
const { Alert, AlertConfirmation } = require('../models');

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

exports.createAlert = async (req, res) => {
  try {
    const { type, latitude, longitude } = req.body;
    const userId = req.user.id;

    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    const newAlert = await Alert.create({
      userId, type, latitude, longitude, expiresAt
    });

    res.status(201).json(newAlert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    const activeAlerts = await Alert.findAll({
      where: {
        expiresAt: { [Op.gt]: new Date() }
      },
      include: ['confirmations']
    });

    const nearbyAlerts = activeAlerts.filter(alert => {
      const distance = calculateDistance(lat, lng, alert.latitude, alert.longitude);
      return distance <= radius;
    });

    res.status(200).json(nearbyAlerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.confirmAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id;

    const alert = await Alert.findByPk(alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Nie znaleziono alertu.' });
    }

    if (alert.userId == userId) {
      return res.status(400).json({ message: 'Nie możesz potwierdzić własnego zgłoszenia.' });
    }

    const existingConfirmation = await AlertConfirmation.findOne({
      where: { alertId, userId }
    });

    if (existingConfirmation) {
      return res.status(400).json({ message: 'Już potwierdziłeś ten alert.' });
    }

    await AlertConfirmation.create({ alertId, userId });

    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

    try {
      await axios.patch(`${authServiceUrl}/api/users/${userId}/points`, {
        points: 1,
        reason: 'confirm_alert'
      }, {
        headers: { Authorization: req.headers['authorization'] }
      });
    } catch (err) {
      console.error('Nie udało się przydzielić punktu potwierdzającemu:', err.message);
    }

    try {
      await axios.patch(`${authServiceUrl}/api/users/${alert.userId}/points`, {
        points: 2,
        reason: 'alert_validated_by_other'
      }, {
        headers: { Authorization: req.headers['authorization'] }
      });
    } catch (err) {
      console.error('Nie udało się przydzielić punktów twórcy alertu:', err.message);
    }

    res.status(201).json({ message: 'Alert potwierdzony.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = req.user.id; 
    const alert = await Alert.findByPk(alertId);

    if (!alert) {
      return res.status(404).json({ message: 'Nie znaleziono alertu.' });
    }

    if (alert.userId != userId) {
      return res.status(403).json({ message: 'Brak uprawnień. Tylko twórca może usunąć ten alert.' });
    }

    await alert.destroy();
    return res.status(200).json({ message: 'Alert został pomyślnie usunięty.' });
  } catch (error) {
    return res.status(500).json({ message: 'Błąd podczas usuwania alertu.', error: error.message });
  }
};