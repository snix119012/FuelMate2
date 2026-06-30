const Station = require('./Station');
const FuelType = require('./FuelType');
const Price = require('./Price');
const StationRating = require('./StationRating');

/**
 * Relacje między tabelami w station-service:
 *
 * - Station 1:N Price      (jedna stacja ma wiele cen)
 * - FuelType 1:N Price     (jeden typ paliwa może mieć wiele cen)
 * - Station 1:N StationRating (jedna stacja ma wiele opinii)
 */

// Stacja może mieć wiele cen paliw
Station.hasMany(Price, { foreignKey: 'stationId' });
Price.belongsTo(Station, { foreignKey: 'stationId' });

// Typ paliwa może występować w wielu cenach
FuelType.hasMany(Price, { foreignKey: 'fuelTypeId' });
Price.belongsTo(FuelType, { foreignKey: 'fuelTypeId' });

// Stacja może mieć wiele opinii użytkowników
Station.hasMany(StationRating, { foreignKey: 'stationId' });
StationRating.belongsTo(Station, { foreignKey: 'stationId' });

// Po dodaniu nowej opinii automatycznie przeliczamy średnią ocenę stacji
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
