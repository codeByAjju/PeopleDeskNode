import { Country as CSC_Country, State as CSC_State, City as CSC_City } from 'country-state-city';

export const up = async (queryInterface) => {
  const now = new Date();
  console.log('🚀 Running Geo Seeder (Country -> State -> City)...');

  // 1. Countries
  const allCscCountries = CSC_Country.getAllCountries();
  const [existingCountries] = await queryInterface.sequelize.query(
    'SELECT id, iso_code as isoCode, name FROM countries;'
  );

  const countryMapByIso = new Map();
  existingCountries.forEach((c) => countryMapByIso.set(c.isoCode, c.id));

  const newCountriesToInsert = [];
  for (const c of allCscCountries) {
    if (!countryMapByIso.has(c.isoCode)) {
      newCountriesToInsert.push({
        name: (c.name || '').substring(0, 100),
        iso_code: (c.isoCode || '').substring(0, 10),
        phone_code: (c.phonecode ? (c.phonecode.startsWith('+') ? c.phonecode : `+${c.phonecode}`) : '').substring(0, 10),
        currency_symbol: (c.currency || '').substring(0, 10),
        status: 'active',
        created_at: now,
        updated_at: now,
      });
    }
  }

  if (newCountriesToInsert.length > 0) {
    await queryInterface.bulkInsert('countries', newCountriesToInsert, {});
  }

  const [dbCountries] = await queryInterface.sequelize.query(
    'SELECT id, iso_code as isoCode, name FROM countries;'
  );
  dbCountries.forEach((c) => countryMapByIso.set(c.isoCode, c.id));

  // 2. States
  const allCscStates = CSC_State.getAllStates();
  const [existingStates] = await queryInterface.sequelize.query(
    'SELECT id, country_id as countryId, name FROM states;'
  );

  const stateMapByCountryAndName = new Map();
  const stateMapByCode = new Map();

  existingStates.forEach((s) => {
    stateMapByCountryAndName.set(`${s.countryId}_${s.name.toLowerCase()}`, s.id);
  });

  const statesToInsert = [];
  for (const s of allCscStates) {
    const countryId = countryMapByIso.get(s.countryCode);
    if (!countryId) continue;

    const keyName = `${countryId}_${s.name.toLowerCase()}`;
    if (!stateMapByCountryAndName.has(keyName)) {
      statesToInsert.push({
        country_id: countryId,
        name: (s.name || '').substring(0, 100),
        status: 'active',
        created_at: now,
        updated_at: now,
      });
      stateMapByCountryAndName.set(keyName, true);
    }
  }

  if (statesToInsert.length > 0) {
    const STATE_BATCH_SIZE = 1000;
    for (let i = 0; i < statesToInsert.length; i += STATE_BATCH_SIZE) {
      const batch = statesToInsert.slice(i, i + STATE_BATCH_SIZE);
      await queryInterface.bulkInsert('states', batch, {});
    }
  }

  const [allDbStates] = await queryInterface.sequelize.query(
    'SELECT id, country_id as countryId, name FROM states;'
  );
  allDbStates.forEach((s) => {
    stateMapByCountryAndName.set(`${s.countryId}_${s.name.toLowerCase()}`, s.id);
  });

  for (const s of allCscStates) {
    const countryId = countryMapByIso.get(s.countryCode);
    if (!countryId) continue;
    const stateId = stateMapByCountryAndName.get(`${countryId}_${s.name.toLowerCase()}`);
    if (stateId) {
      stateMapByCode.set(`${s.countryCode}_${s.isoCode}`, stateId);
    }
  }

  // 3. Cities
  const allCscCities = CSC_City.getAllCities();
  const [[{ count: existingCityCount }]] = await queryInterface.sequelize.query(
    'SELECT COUNT(*) as count FROM cities;'
  );

  if (parseInt(existingCityCount, 10) < 100000) {
    const citiesToInsert = [];
    const seenCityKeys = new Set();

    for (const c of allCscCities) {
      const countryId = countryMapByIso.get(c.countryCode);
      if (!countryId) continue;

      let stateId = stateMapByCode.get(`${c.countryCode}_${c.stateCode}`);
      if (!stateId) {
        stateId = stateMapByCountryAndName.get(`${countryId}_${(c.stateCode || '').toLowerCase()}`);
      }

      if (!stateId) continue;

      const uniqueKey = `${countryId}_${stateId}_${c.name.toLowerCase()}`;
      if (!seenCityKeys.has(uniqueKey)) {
        seenCityKeys.add(uniqueKey);
        citiesToInsert.push({
          state_id: stateId,
          country_id: countryId,
          name: (c.name || '').substring(0, 100),
          status: 'active',
          created_at: now,
          updated_at: now,
        });
      }
    }

    const CITY_BATCH_SIZE = 5000;
    for (let i = 0; i < citiesToInsert.length; i += CITY_BATCH_SIZE) {
      const batch = citiesToInsert.slice(i, i + CITY_BATCH_SIZE);
      await queryInterface.bulkInsert('cities', batch, {});
    }
  }

  console.log('✅ Geo Seeding finished.');
};

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete('cities', null, {});
  await queryInterface.bulkDelete('states', null, {});
  await queryInterface.bulkDelete('countries', null, {});
};
