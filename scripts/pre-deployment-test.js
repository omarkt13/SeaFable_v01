
const fs = require('fs');

console.log('🧪 Running pre-deployment tests...');

// Basic file structure validation
const criticalFiles = [
  'app/layout.tsx',
  'app/page.tsx', 
  'next.config.mjs',
  'package.json'
];

let allFilesExist = true;

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Generate test report
const testReport = {
  timestamp: new Date().toISOString(),
  fileStructureCheck: allFilesExist,
  status: allFilesExist ? 'PASS' : 'FAIL'
};

fs.writeFileSync('pre-deployment-test-report.json', JSON.stringify(testReport, null, 2));

console.log(`\n🏁 Pre-deployment tests: ${testReport.status}`);
process.exit(allFilesExist ? 0 : 1);
