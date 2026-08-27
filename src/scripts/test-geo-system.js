import models from '../models/index.js';
import repositories from '../repositories/index.js';
import { validateLocationHierarchy } from '../middlewares/geo-middleware.js';

const { sequelize, Country, State, City, Company, Branch, Location, Employee } = models;
const { countryRepository, stateRepository, cityRepository } = repositories;

async function runTests() {
  console.log('🧪 Starting Verification Tests for Geo & HRMS System...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ DB Connection Verified.');

    // ----------------------------------------------------
    // TEST 1: Model Associations Verification
    // ----------------------------------------------------
    console.log('\n--- Test 1: Model Associations ---');

    console.log('Country associations:', Object.keys(Country.associations));
    console.log('State associations:', Object.keys(State.associations));
    console.log('City associations:', Object.keys(City.associations));
    console.log('Company associations:', Object.keys(Company.associations));
    console.log('Branch associations:', Object.keys(Branch.associations));
    console.log('Location associations:', Object.keys(Location.associations));
    console.log('Employee associations:', Object.keys(Employee.associations));

    if (!Country.associations.states || !Country.associations.cities) {
      throw new Error('Country missing states or cities association');
    }
    if (!State.associations.country || !State.associations.cities) {
      throw new Error('State missing country or cities association');
    }
    if (!City.associations.state || !City.associations.country) {
      throw new Error('City missing state or country association');
    }
    if (!Company.associations.country || !Company.associations.state || !Company.associations.city) {
      throw new Error('Company missing country/state/city associations');
    }
    if (!Branch.associations.country || !Branch.associations.state || !Branch.associations.city) {
      throw new Error('Branch missing country/state/city associations');
    }
    if (!Location.associations.country || !Location.associations.state || !Location.associations.city) {
      throw new Error('Location missing country/state/city associations');
    }
    if (!Employee.associations.country || !Employee.associations.state || !Employee.associations.city) {
      throw new Error('Employee missing country/state/city associations');
    }
    console.log('✅ All Model Associations Verified Successfully.');

    // ----------------------------------------------------
    // TEST 2: Geo Repositories & Relational Queries
    // ----------------------------------------------------
    console.log('\n--- Test 2: Geo Repositories & Queries ---');

    // Fetch India
    const india = await Country.findOne({ where: { isoCode: 'IN' } });
    if (!india) throw new Error('India not found in countries');
    console.log(`✅ Country Found: ${india.name} (ID: ${india.id}, ISO: ${india.isoCode}, Dial: ${india.phoneCode}, Currency: ${india.currencySymbol})`);

    // Fetch States of India
    const statesOfIndia = await stateRepository.getStatesByCountryId(india.id, { query: { search: 'Madhya' } });
    const mp = statesOfIndia.find((s) => s.name.toLowerCase().includes('madhya'));
    if (!mp) throw new Error('Madhya Pradesh not found in states of India');
    console.log(`✅ State Found: ${mp.name} (ID: ${mp.id}, Country: ${mp.country?.name})`);

    // Fetch Cities of MP
    const citiesOfMp = await cityRepository.getCitiesByStateId(mp.id, { query: { search: 'Indore' } });
    const indore = citiesOfMp.find((c) => c.name.toLowerCase() === 'indore');
    if (!indore) throw new Error('Indore not found in cities of MP');
    console.log(`✅ City Found: ${indore.name} (ID: ${indore.id}, State: ${indore.state?.name}, Country: ${indore.country?.name})`);

    // Fetch US -> California
    const usa = await Country.findOne({ where: { isoCode: 'US' } });
    const california = await State.findOne({ where: { countryId: usa.id, name: 'California' } });
    console.log(`✅ US Found (ID: ${usa.id}), California Found (ID: ${california.id})`);

    // ----------------------------------------------------
    // TEST 3: Location Hierarchy Validation Middleware
    // ----------------------------------------------------
    console.log('\n--- Test 3: Hierarchy Validation Middleware ---');

    // Case A: Valid combination: India -> MP -> Indore
    let validPass = false;
    const reqValid = {
      body: {
        countryId: india.id,
        stateId: mp.id,
        cityId: indore.id,
      },
    };
    const resValid = {
      status: (code) => ({
        json: (data) => console.log('Unexpected error response:', code, data),
      }),
    };
    await validateLocationHierarchy(reqValid, resValid, () => {
      validPass = true;
    });

    if (!validPass) {
      throw new Error('Valid hierarchy (India -> MP -> Indore) failed validation!');
    }
    console.log('✅ Valid Hierarchy Passed: India -> Madhya Pradesh -> Indore');

    // Case B: Invalid combination: India -> California -> Indore
    let invalidCaught = false;
    let errorMessage = '';
    const reqInvalid = {
      body: {
        countryId: india.id,
        stateId: california.id,
        cityId: indore.id,
      },
    };
    const resInvalid = {
      status: (code) => ({
        json: (data) => {
          invalidCaught = true;
          errorMessage = data.message;
        },
      }),
    };
    await validateLocationHierarchy(reqInvalid, resInvalid, () => {});

    if (!invalidCaught) {
      throw new Error('Invalid hierarchy (India -> California -> Indore) was NOT rejected!');
    }
    console.log(`✅ Invalid Hierarchy Correctly Rejected: "${errorMessage}"`);

    // Case C: Invalid combination: US -> MP -> Indore (State doesn't belong to US)
    let invalidCountryCaught = false;
    const reqInvalidCountry = {
      body: {
        countryId: usa.id,
        stateId: mp.id,
      },
    };
    const resInvalidCountry = {
      status: (code) => ({
        json: (data) => {
          invalidCountryCaught = true;
          errorMessage = data.message;
        },
      }),
    };
    await validateLocationHierarchy(reqInvalidCountry, resInvalidCountry, () => {});

    if (!invalidCountryCaught) {
      throw new Error('Invalid country-state hierarchy was NOT rejected!');
    }
    console.log(`✅ Invalid Country-State Correctly Rejected: "${errorMessage}"`);

    // ----------------------------------------------------
    // TEST 4: Nested Eager Loading on Company
    // ----------------------------------------------------
    console.log('\n--- Test 4: Eager Loading Test on Company ---');
    // Test creating a dummy company or querying with includes
    const testCompanyData = {
      name: `Test Geo Company ${Date.now()}`,
      code: `TGC_${Date.now()}`,
      email: `test_${Date.now()}@company.com`,
      phoneNumber: '9876543210',
      address: '123 Main Street',
      countryId: india.id,
      stateId: mp.id,
      cityId: indore.id,
      postalCode: '452001',
      status: 'active',
    };

    const createdCompany = await Company.create(testCompanyData);
    const fetchedCompany = await Company.findOne({
      where: { id: createdCompany.id },
      include: [
        { model: Country, as: 'country' },
        { model: State, as: 'state' },
        { model: City, as: 'city' },
      ],
    });

    console.log(`✅ Created & Queried Company: ${fetchedCompany.name}`);
    console.log(`   -> Country: ${fetchedCompany.country?.name} (${fetchedCompany.country?.isoCode})`);
    console.log(`   -> State: ${fetchedCompany.state?.name}`);
    console.log(`   -> City: ${fetchedCompany.city?.name}`);

    // Cleanup test company
    await createdCompany.destroy();
    console.log('✅ Cleaned up test company.');

    console.log('\n🎉 ALL 4 TEST SUITES PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ Test failure:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runTests();
