const axios = require('axios');

const BASE_URL = 'https://farmvest-live-apis-jn6cma3vvq-el.a.run.app';
// We still might need proxy for the script if direct access is 403, but 404 meant "Route Not Found".
// I'll try direct access first.
const API_KEY = 'bWFya3dhdmUtZmFybXZlc3QtdGVzdHRpbmctYXBpa2V5';

async function testApi() {
    try {
        console.log('--- TEST 1: /api/farm/get_all_farms ---');
        try {
            const res1 = await axios.get(`${BASE_URL}/api/farm/get_all_farms`, { headers: { 'Authorization': API_KEY } });
            console.log('Success:', res1.status, res1.data.length ? 'Data found' : 'Empty array');
        } catch (e) {
            console.log('Failed:', e.response ? e.response.status : e.message, e.response ? e.response.data : '');
        }

        console.log('\n--- TEST 2: /api/farm/get_all_farms?location=KURNOOL ---');
        try {
            const res2 = await axios.get(`${BASE_URL}/api/farm/get_all_farms?location=KURNOOL`, { headers: { 'Authorization': API_KEY } });
            console.log('Success:', res2.status, res2.data.length ? 'Data found' : 'Empty array');
        } catch (e) {
            console.log('Failed:', e.response ? e.response.status : e.message, e.response ? e.response.data : '');
        }

    } catch (error) {
        console.error('Script Error:', error.message);
    }
}

testApi();
