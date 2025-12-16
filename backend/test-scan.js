const axios = require('axios');

async function testScanEndpoint() {
    try {
        // First, let's test without auth to see what error we get
        const response = await axios.post('http://localhost:5000/api/tickets/scan', {
            bookingReference: 'TEST-123'
        });
        console.log('Success:', response.data);
    } catch (error) {
        console.log('Error status:', error.response?.status);
        console.log('Error message:', error.response?.data);
        console.log('Error:', error.message);
    }
}

testScanEndpoint();
