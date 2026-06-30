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

// ETAP 6: F-ST-06 - Przeliczanie ocen po dodaniu nowej opinii
StationRating.afterCreate(async (ratingInstance, options) => {
  const stationId = ratingInstance.stationId;
  const ratings = await StationRating.findAll({ where: { stationId } });
  
  const count = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const average = count === 0 ? 0 : sum / count;

  await Station.update({
    ratingCount: count,
    averageRating: parseFloat(average.toFixed(2))
  }, {
    where: { id: stationId }
  });
});

module.exports = {
  Station,
  FuelType,
  Price,
  StationRating
};
