import { Country as CSC_Country, State as CSC_State, City as CSC_City } from 'country-state-city';
import models from '../models/index.js';

const { sequelize, Country, State, City } = models;

async function seedGeoData() {
  const startTime = Date.now();
  console.log('🚀 Starting Worldwide Geo Data Seeding (Country -> State -> City)...');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    // Ensure tables exist and schema is altered with new columns
    await sequelize.sync({ alter: true });

    // ----------------------------------------------------
    // 1. SEED COUNTRIES
    // ----------------------------------------------------
    console.log('\n📦 Fetching countries from country-state-city...');
    const allCscCountries = CSC_Country.getAllCountries();
    console.log(`Found ${allCscCountries.length} countries.`);

    const now = new Date();
    const existingCountries = await Country.findAll({
      attributes: ['id', 'isoCode', 'name'],
    });

    const countryMapByIso = new Map();
    existingCountries.forEach((c) => countryMapByIso.set(c.isoCode, c.id));

    const newCountriesToInsert = [];
    for (const c of allCscCountries) {
      if (!countryMapByIso.has(c.isoCode)) {
        newCountriesToInsert.push({
          name: (c.name || '').substring(0, 100),
          isoCode: (c.isoCode || '').substring(0, 10),
          phoneCode: (c.phonecode ? (c.phonecode.startsWith('+') ? c.phonecode : `+${c.phonecode}`) : '').substring(0, 10),
          currencySymbol: (c.currency || '').substring(0, 10),
          status: 'active',
          created_at: now,
          updated_at: now,
        });
      }
    }

    if (newCountriesToInsert.length > 0) {
      console.log(`Inserting ${newCountriesToInsert.length} new countries...`);
      await Country.bulkCreate(newCountriesToInsert, { ignoreDuplicates: true });
    } else {
      console.log('All countries already present in database.');
    }

    // Refresh country map
    const dbCountries = await Country.findAll({
      attributes: ['id', 'isoCode', 'name'],
    });
    dbCountries.forEach((c) => countryMapByIso.set(c.isoCode, c.id));
    console.log(`✅ Total Countries in DB: ${countryMapByIso.size}`);

    // ----------------------------------------------------
    // 2. SEED STATES
    // ----------------------------------------------------
    console.log('\n📦 Fetching states from country-state-city...');
    const allCscStates = CSC_State.getAllStates();
    console.log(`Found ${allCscStates.length} states/provinces.`);

    const existingStates = await State.findAll({
      attributes: ['id', 'countryId', 'name'],
    });

    // Map: countryId_stateName -> stateId
    const stateMapByCountryAndName = new Map();
    // Map: countryCode_stateCode -> stateId
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
          countryId,
          name: (s.name || '').substring(0, 100),
          status: 'active',
          created_at: now,
          updated_at: now,
        });
        stateMapByCountryAndName.set(keyName, true); // temporary mark
      }
    }

    if (statesToInsert.length > 0) {
      console.log(`Inserting ${statesToInsert.length} new states in batches...`);
      const STATE_BATCH_SIZE = 1000;
      for (let i = 0; i < statesToInsert.length; i += STATE_BATCH_SIZE) {
        const batch = statesToInsert.slice(i, i + STATE_BATCH_SIZE);
        await State.bulkCreate(batch, { ignoreDuplicates: true });
      }
    } else {
      console.log('All states already present in database.');
    }

    // Refresh state maps
    const allDbStates = await State.findAll({
      attributes: ['id', 'countryId', 'name'],
    });
    allDbStates.forEach((s) => {
      stateMapByCountryAndName.set(`${s.countryId}_${s.name.toLowerCase()}`, s.id);
    });

    // Also build code-based map for city linking
    for (const s of allCscStates) {
      const countryId = countryMapByIso.get(s.countryCode);
      if (!countryId) continue;
      const stateId = stateMapByCountryAndName.get(`${countryId}_${s.name.toLowerCase()}`);
      if (stateId) {
        stateMapByCode.set(`${s.countryCode}_${s.isoCode}`, stateId);
      }
    }
    console.log(`✅ Total States in DB: ${allDbStates.length}`);

    // ----------------------------------------------------
    // 3. SEED CITIES
    // ----------------------------------------------------
    console.log('\n📦 Fetching cities from country-state-city...');
    const allCscCities = CSC_City.getAllCities();
    console.log(`Found ${allCscCities.length} cities.`);

    const existingCitiesCount = await City.count();
    console.log(`Existing cities in DB: ${existingCitiesCount}`);

    if (existingCitiesCount >= 100000) {
      console.log('Cities appear already seeded. Skipping bulk insert.');
    } else {
      console.log('Preparing cities for bulk insert...');
      const citiesToInsert = [];
      const seenCityKeys = new Set();

      for (const c of allCscCities) {
        const countryId = countryMapByIso.get(c.countryCode);
        if (!countryId) continue;

        let stateId = stateMapByCode.get(`${c.countryCode}_${c.stateCode}`);
        if (!stateId) {
          // fallback search
          stateId = stateMapByCountryAndName.get(`${countryId}_${(c.stateCode || '').toLowerCase()}`);
        }

        if (!stateId) continue;

        const uniqueKey = `${countryId}_${stateId}_${c.name.toLowerCase()}`;
        if (!seenCityKeys.has(uniqueKey)) {
          seenCityKeys.add(uniqueKey);
          citiesToInsert.push({
            stateId,
            countryId,
            name: (c.name || '').substring(0, 100),
            status: 'active',
            created_at: now,
            updated_at: now,
          });
        }
      }

      console.log(`Inserting ${citiesToInsert.length} cities in chunks of 5000...`);
      const CITY_BATCH_SIZE = 5000;
      for (let i = 0; i < citiesToInsert.length; i += CITY_BATCH_SIZE) {
        const batch = citiesToInsert.slice(i, i + CITY_BATCH_SIZE);
        await City.bulkCreate(batch, { ignoreDuplicates: true });
        const progress = Math.min(i + CITY_BATCH_SIZE, citiesToInsert.length);
        console.log(`  -> Inserted ${progress} / ${citiesToInsert.length} cities...`);
      }
    }

    const totalCities = await City.count();
    console.log(`✅ Total Cities in DB: ${totalCities}`);

    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 Worldwide Geo Seeding completed successfully in ${elapsedSeconds}s!`);
  } catch (error) {
    console.error('❌ Error during Geo Seeding:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedGeoData();
