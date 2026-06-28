const Station = require('./Station');
const FuelType = require('./FuelType');
const Price = require('./Price');
const StationRating = require('./StationRating');

// Asocjacje
Station.hasMany(Price, { foreignKey: 'stationId' });
Price.belongsTo(Station, { foreignKey: 'stationId' });

FuelType.hasMany(Price, { foreignKey: 'fuelTypeId' });
Price.belongsTo(FuelType, { foreignKey: 'fuelTypeId' });

Station.hasMany(StationRating, { foreignKey: 'stationId' });
StationRating.belongsTo(Station, { foreignKey: 'stationId' });

module.exports = {
  Station,
  FuelType,
  Price,
  StationRating
};
