
const { exec } = require('child_process');
const fs = require('fs');

async function testBuild() {
  console.log('🏗️  BUILD VERIFICATION TEST');
  console.log('=' .repeat(50));
  
  return new Promise((resolve) => {
    console.log('Starting Next.js build...');
    
    exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Build failed!');
        console.log('Error:', error.message);
        console.log('Stderr:', stderr);
        
        fs.writeFileSync('build-error-report.txt', `
BUILD FAILED
============
Error: ${error.message}
Stderr: ${stderr}
Stdout: ${stdout}
Timestamp: ${new Date().toISOString()}
        `);
        
        resolve(false);
      } else {
        console.log('✅ Build successful!');
        console.log('Build output preview:');
        console.log(stdout.split('\n').slice(-10).join('\n'));
        
        // Check if .next directory was created
        if (fs.existsSync('.next')) {
          console.log('✅ .next directory created');
          
          // Check for critical build files
          const criticalBuildFiles = [
            '.next/static',
            '.next/server'
          ];
          
          criticalBuildFiles.forEach(file => {
            if (fs.existsSync(file)) {
              console.log(`✅ ${file} exists`);
            } else {
              console.log(`⚠️  ${file} missing`);
            }
          });
          
        } else {
          console.log('⚠️  .next directory not found');
        }
        
        resolve(true);
      }
    });
  });
}

testBuild();
