import express from 'express';
import bodyParser from 'body-parser';
import register from '../routes/index.js';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import models from '../models/index.js';

const { sequelize, Country, State, City, Branch, Location, Employee } = models;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
register(app);

const token = jwt.sign(
  {
    id: 1,
    email: 'admin@peopleDesk.com',
    role: 'super_admin',
  },
  config.jwtSecret || 'PeopleDesk!',
  { expiresIn: '1h' }
);

async function testLocationEndpoints() {
  console.log('🚀 Starting Location REST API Endpoints Test...');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    // Ensure we have a valid Country, State, City, and Branch for testing
    let country = await Country.findOne({ where: { status: 'active' } });
    if (!country) {
      country = await Country.create({ name: 'TestCountry', isoCode: 'TC', phoneCode: '+99', currencySymbol: '$' });
    }

    let state = await State.findOne({ where: { countryId: country.id, status: 'active' } });
    if (!state) {
      state = await State.create({ name: 'TestState', countryId: country.id, isoCode: 'TS' });
    }

    let city = await City.findOne({ where: { stateId: state.id, status: 'active' } });
    if (!city) {
      city = await City.create({ name: 'TestCity', stateId: state.id, countryId: country.id });
    }

    const testBranchCode = `BR-LOC-${Date.now()}`;
    const branch = await Branch.create({
      name: `Test Branch for Location ${Date.now()}`,
      code: testBranchCode,
      address: '123 Test Street',
      countryId: country.id,
      stateId: state.id,
      cityId: city.id,
      postalCode: '12345',
      phoneNumber: '9876543210',
      status: 'active',
    });
    console.log(`✅ Test Branch created (ID: ${branch.id}, Code: ${branch.code})`);

    const uniqueCode = `LOC-${Date.now()}`;
    const uniqueName = `HQ Location ${Date.now()}`;

    // 1. POST /location
    console.log('\n--- 1. Testing POST /location ---');
    const createRes = await fetch(`${baseUrl}/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: uniqueName,
        code: uniqueCode,
        address: '456 Tech Park, Sector 5',
        branchId: branch.id,
        countryId: country.id,
        stateId: state.id,
        cityId: city.id,
        postalCode: '452001',
        status: 'active',
      }),
    });

    const createData = await createRes.json();
    console.log(`HTTP Status: ${createRes.status}`);
    console.log(`Response:`, createData);

    if (createRes.status !== 200 || !createData.status) {
      throw new Error(`Create location failed: ${JSON.stringify(createData)}`);
    }
    const locationId = createData.result.id;

    // 2. GET /location/list
    console.log('\n--- 2. Testing GET /location/list ---');
    const listRes = await fetch(`${baseUrl}/location/list?search=${uniqueCode}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();
    console.log(`HTTP Status: ${listRes.status}`);
    console.log(`Total Found: ${listData.result.length}, Pagination:`, listData.pagination);

    if (listRes.status !== 200 || !listData.status || listData.result.length === 0) {
      throw new Error(`Location list failed: ${JSON.stringify(listData)}`);
    }

    // 3. GET /location/:id
    console.log(`\n--- 3. Testing GET /location/${locationId} ---`);
    const getRes = await fetch(`${baseUrl}/location/${locationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const getData = await getRes.json();
    console.log(`HTTP Status: ${getRes.status}`);
    console.log(`Location details:`, {
      id: getData.result.id,
      name: getData.result.name,
      code: getData.result.code,
      branch: getData.result.branch?.name,
      country: getData.result.country?.name,
      state: getData.result.state?.name,
      city: getData.result.city?.name,
    });

    if (getRes.status !== 200 || !getData.status) {
      throw new Error(`Get location by ID failed: ${JSON.stringify(getData)}`);
    }

    // 4. PUT /location-update/:id
    console.log(`\n--- 4. Testing PUT /location-update/${locationId} ---`);
    const updatedName = `${uniqueName} Updated`;
    const updateRes = await fetch(`${baseUrl}/location-update/${locationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: locationId,
        name: updatedName,
        code: uniqueCode,
        address: '789 Updated Avenue',
        branchId: branch.id,
        countryId: country.id,
        stateId: state.id,
        cityId: city.id,
        postalCode: '452010',
        status: 'active',
      }),
    });
    const updateData = await updateRes.json();
    console.log(`HTTP Status: ${updateRes.status}`);
    console.log(`Updated Location:`, updateData.result?.name);

    if (updateRes.status !== 200 || !updateData.status) {
      throw new Error(`Update location failed: ${JSON.stringify(updateData)}`);
    }

    // 5. GET /location/branch/:branchId
    console.log(`\n--- 5. Testing GET /location/branch/${branch.id} ---`);
    const branchLocRes = await fetch(`${baseUrl}/location/branch/${branch.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const branchLocData = await branchLocRes.json();
    console.log(`HTTP Status: ${branchLocRes.status}`);
    console.log(`Locations for Branch ${branch.id}: ${branchLocData.result.length}`);

    if (branchLocRes.status !== 200 || !branchLocData.status || branchLocData.result.length === 0) {
      throw new Error(`Get locations by branch failed: ${JSON.stringify(branchLocData)}`);
    }

    // 6. Test Employee Protection on DELETE
    console.log('\n--- 6. Testing PATCH /location-delete/:id with assigned Employee protection ---');
    // Create a mock employee assigned to this location
    let dept = await models.Department.findOne();
    if (!dept) {
      dept = await models.Department.create({ name: 'TestDept' });
    }
    let desig = await models.Designation.findOne();
    if (!desig) {
      desig = await models.Designation.create({ name: 'TestDesig', code: `DES-${Date.now()}`, departmentId: dept.id });
    }

    const testEmpCode = `EMP-LOC-${Date.now()}`;
    const testEmployee = await Employee.create({
      employeeCode: testEmpCode,
      firstName: 'Test',
      lastName: 'Worker',
      email: `testworker_${Date.now()}@peopledesk.com`,
      dateOfJoining: '2026-01-01',
      employmentType: 'full_time',
      employmentStatus: 'active',
      departmentId: dept.id,
      designationId: desig.id,
      branchId: branch.id,
      locationId: locationId,
    });
    console.log(`Created test Employee assigned to location (ID: ${testEmployee.id})`);

    // Try to delete location -> Should be BLOCKED with 400
    const blockedDeleteRes = await fetch(`${baseUrl}/location-delete/${locationId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const blockedDeleteData = await blockedDeleteRes.json();
    console.log(`HTTP Status (Expected 400): ${blockedDeleteRes.status}`);
    console.log(`Response message:`, blockedDeleteData.message);

    if (blockedDeleteRes.status !== 400) {
      throw new Error(`Expected deletion to be blocked due to assigned employee, but got status ${blockedDeleteRes.status}`);
    }

    // Remove employee assignment to test successful deletion
    await testEmployee.destroy();
    console.log('Removed test employee assignment. Now attempting deletion again...');

    const deleteRes = await fetch(`${baseUrl}/location-delete/${locationId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const deleteData = await deleteRes.json();
    console.log(`HTTP Status: ${deleteRes.status}`);
    console.log(`Delete Response:`, deleteData);

    if (deleteRes.status !== 200 || !deleteData.success) {
      throw new Error(`Delete location failed: ${JSON.stringify(deleteData)}`);
    }

    // 7. PATCH /location-restore/:id
    console.log(`\n--- 7. Testing PATCH /location-restore/${locationId} ---`);
    const restoreRes = await fetch(`${baseUrl}/location-restore/${locationId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const restoreData = await restoreRes.json();
    console.log(`HTTP Status: ${restoreRes.status}`);
    console.log(`Restore Response:`, restoreData);

    if (restoreRes.status !== 200 || !restoreData.status) {
      throw new Error(`Restore location failed: ${JSON.stringify(restoreData)}`);
    }

    // Clean up test data
    await Location.destroy({ where: { id: locationId } });
    await Branch.destroy({ where: { id: branch.id } });
    console.log('\n🧹 Cleaned up test records.');

    console.log('\n🎉 ALL 7 LOCATION REST API ENDPOINTS TESTED & PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Location Endpoint Test failed:', error);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
}

testLocationEndpoints();
