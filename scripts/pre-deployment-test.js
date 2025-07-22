
const fs = require('fs');

async function testAPIEndpoints() {
  console.log('🧪 API ENDPOINT TESTING');
  console.log('=' .repeat(50));
  
  const testResults = [];
  
  // Test basic API endpoints
  const endpoints = [
    { path: '/api/business/test', method: 'GET', description: 'Business portal test' },
    { path: '/api/business/debug', method: 'GET', description: 'Debug endpoint' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.description}...`);
      
      // Note: In a real deployment check, you'd make actual HTTP requests
      // For now, we'll check if the route files exist
      const routePath = `app/api${endpoint.path}/route.ts`;
      
      if (fs.existsSync(routePath)) {
        console.log(`✅ ${endpoint.description} - Route file exists`);
        testResults.push({ ...endpoint, status: 'PASS', error: null });
      } else {
        console.log(`❌ ${endpoint.description} - Route file missing`);
        testResults.push({ ...endpoint, status: 'FAIL', error: 'Route file not found' });
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint.description} - Error: ${error.message}`);
      testResults.push({ ...endpoint, status: 'FAIL', error: error.message });
    }
  }
  
  // Test critical files
  const criticalFiles = [
    'lib/supabase/server.ts',
    'lib/supabase/client.ts',
    'lib/auth-context.tsx'
  ];
  
  console.log('\n🔧 CRITICAL FILES CHECK');
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });
  
  // Generate test report
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: testResults.length,
    passed: testResults.filter(r => r.status === 'PASS').length,
    failed: testResults.filter(r => r.status === 'FAIL').length,
    results: testResults
  };
  
  fs.writeFileSync('pre-deployment-test-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n📊 TEST SUMMARY');
  console.log(`Total: ${report.totalTests}`);
  console.log(`Passed: ${report.passed}`);
  console.log(`Failed: ${report.failed}`);
  
  return report.failed === 0;
}

testAPIEndpoints();
