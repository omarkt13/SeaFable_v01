
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class DeploymentReadinessChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const entry = { message, type, timestamp };
    
    switch (type) {
      case 'error':
        this.issues.push(entry);
        console.log(`❌ ${message}`);
        break;
      case 'warning':
        this.warnings.push(entry);
        console.log(`⚠️  ${message}`);
        break;
      case 'success':
        this.passed.push(entry);
        console.log(`✅ ${message}`);
        break;
      default:
        console.log(`ℹ️  ${message}`);
    }
  }

  async checkBuildCompilation() {
    this.log('Checking Next.js build compilation...');
    
    return new Promise((resolve) => {
      exec('npm run build', { timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
          this.log('Build compilation failed', 'error');
          if (stderr) {
            const errorLines = stderr.split('\n').filter(line => line.includes('Error')).slice(0, 3);
            errorLines.forEach(line => this.log(`Build Error: ${line.trim()}`, 'error'));
          }
        } else {
          this.log('Build compilation successful', 'success');
        }
        resolve();
      });
    });
  }

  async checkDatabaseSchema() {
    this.log('Checking database schema consistency...');
    
    // Check for common schema issues
    const schemaFile = 'lib/database-schema.ts';
    if (fs.existsSync(schemaFile)) {
      this.log('Database schema file exists', 'success');
    } else {
      this.log('Database schema file missing', 'warning');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.passed.length + this.warnings.length + this.issues.length,
        passed: this.passed.length,
        warnings: this.warnings.length,
        errors: this.issues.length,
        deploymentReady: this.issues.length === 0
      },
      passed: this.passed,
      warnings: this.warnings,
      errors: this.issues
    };

    fs.writeFileSync('deployment-readiness-report.json', JSON.stringify(report, null, 2));
    return report;
  }

  printSummary(report) {
    console.log('\n🚀 DEPLOYMENT READINESS SUMMARY');
    console.log('==================================');
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log(`Deployment Ready: ${report.summary.deploymentReady ? '✅ YES' : '❌ NO'}`);

    if (report.summary.errors > 0) {
      console.log('\n❌ BLOCKING ISSUES:');
      report.errors.forEach(error => {
        console.log(`  • ${error.message}`);
      });
    }
  }

  async run() {
    console.log('🔍 Starting deployment readiness check...\n');
    
    await this.checkBuildCompilation();
    await this.checkDatabaseSchema();
    
    const report = this.generateReport();
    this.printSummary(report);
    
    return report;
  }
}

const checker = new DeploymentReadinessChecker();
checker.run().then(report => {
  process.exit(report.summary.errors > 0 ? 1 : 0);
}).catch(error => {
  console.error('❌ Deployment readiness check failed:', error);
  process.exit(1);
});
