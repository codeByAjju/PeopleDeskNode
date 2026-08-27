import express from 'express';
import bodyParser from 'body-parser';
import register from '../routes/index.js';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
register(app);

// Generate a mock JWT for testing
const token = jwt.sign(
  {
    id: 1,
    email: 'admin@peopleDesk.com',
    role: 'super_admin',
  },
  config.jwtSecret || 'PeopleDesk!',
  { expiresIn: '1h' }
);

async function testHttpEndpoints() {
  console.log('🌐 Testing Geo REST API Endpoints with Express HTTP Server...');

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. GET /country/list
    console.log('\n--- 1. Testing GET /country/list ---');
    const resCountry = await fetch(`${baseUrl}/country/list?search=India`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const countryData = await resCountry.json();
    console.log(`HTTP Status: ${resCountry.status}`);
    console.log(`Success: ${countryData.status}`);
    console.log(`Message: ${countryData.message}`);
    console.log(`Sample item formatted for React dropdown:`, countryData.result[0]);

    if (!countryData.status || countryData.result.length === 0) {
      throw new Error('Country list API failed');
    }
    const indiaItem = countryData.result.find((c) => c.name === 'India') || countryData.result[0];
    const indiaId = indiaItem.id;
    console.log(`Using Country: ${indiaItem.name} (ID: ${indiaId})`);

    // 2. GET /state/country/:countryId
    console.log(`\n--- 2. Testing GET /state/country/${indiaId} ---`);
    const resState = await fetch(`${baseUrl}/state/country/${indiaId}?search=Madhya`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const stateData = await resState.json();
    console.log(`HTTP Status: ${resState.status}`);
    console.log(`Success: ${stateData.status}`);
    console.log(`Message: ${stateData.message}`);
    console.log(`Sample item formatted for React dropdown:`, stateData.result[0]);

    if (!stateData.status || stateData.result.length === 0) {
      throw new Error('State by country API failed');
    }
    const mpId = stateData.result[0].id;

    // 3. GET /city/state/:stateId
    console.log(`\n--- 3. Testing GET /city/state/${mpId} ---`);
    const resCity = await fetch(`${baseUrl}/city/state/${mpId}?search=Indore`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cityData = await resCity.json();
    console.log(`HTTP Status: ${resCity.status}`);
    console.log(`Success: ${cityData.status}`);
    console.log(`Message: ${cityData.message}`);
    console.log(`Sample item formatted for React dropdown:`, cityData.result[0]);

    if (!cityData.status || cityData.result.length === 0) {
      throw new Error('City by state API failed');
    }

    console.log('\n🎉 ALL HTTP ENDPOINTS TESTED & PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ HTTP Endpoint Test failed:', error);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
}

testHttpEndpoints();
