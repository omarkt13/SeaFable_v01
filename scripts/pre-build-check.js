
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class PreBuildChecker {
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

  checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.log(`${description} exists`, 'success');
      return true;
    } else {
      this.log(`${description} missing: ${filePath}`, 'error');
      return false;
    }
  }

  checkPackageJson() {
    this.log('Checking package.json configuration...');
    
    if (!this.checkFileExists('package.json', 'Package configuration')) {
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check essential scripts
      const requiredScripts = ['build', 'start', 'dev'];
      requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.log(`Script "${script}" defined`, 'success');
        } else {
          this.log(`Missing script: ${script}`, 'error');
        }
      });

      // Check essential dependencies
      const essentialDeps = ['next', 'react', 'react-dom'];
      essentialDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          this.log(`Essential dependency "${dep}" installed`, 'success');
        } else {
          this.log(`Missing essential dependency: ${dep}`, 'error');
        }
      });

    } catch (error) {
      this.log(`Error reading package.json: ${error.message}`, 'error');
    }
  }

  checkNextConfig() {
    this.log('Checking Next.js configuration...');
    
    const configFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
    const configExists = configFiles.some(file => {
      if (fs.existsSync(file)) {
        this.log(`Next.js configuration exists: ${file}`, 'success');
        return true;
      }
      return false;
    });

    if (!configExists) {
      this.log('No Next.js configuration found', 'warning');
    }
  }

  checkTSConfig() {
    this.log('Checking TypeScript configuration...');
    
    if (this.checkFileExists('tsconfig.json', 'TypeScript configuration')) {
      try {
        const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        
        if (tsConfig.compilerOptions) {
          this.log('TypeScript compiler options configured', 'success');
          
          // Check for strict mode
          if (tsConfig.compilerOptions.strict) {
            this.log('TypeScript strict mode enabled', 'success');
          } else {
            this.log('TypeScript strict mode disabled - consider enabling', 'warning');
          }
        }
      } catch (error) {
        this.log(`Error reading tsconfig.json: ${error.message}`, 'error');
      }
    }
  }

  checkEnvironmentFiles() {
    this.log('Checking environment configuration...');
    
    const envFiles = ['.env', '.env.example'];
    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log(`Environment file exists: ${file}`, 'success');
      }
    });

    if (!fs.existsSync('.env')) {
      this.log('No environment files found - use Replit Secrets for environment variables', 'warning');
    }
  }

  checkCriticalDirectories() {
    this.log('Checking critical directory structure...');
    
    const criticalDirs = ['app', 'components', 'lib', 'public'];
    criticalDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.log(`Critical directory exists: ${dir}`, 'success');
      } else {
        this.log(`Missing critical directory: ${dir}`, 'error');
      }
    });
  }

  async runTypeScriptCheck() {
    this.log('Running TypeScript compilation check...');
    
    return new Promise((resolve) => {
      exec('npx tsc --noEmit', { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          if (error.code === 1) {
            // Type errors found
            this.log('TypeScript compilation has errors', 'error');
            if (stderr) {
              const errorLines = stderr.split('\n').filter(line => line.includes('error TS')).slice(0, 3);
              errorLines.forEach(line => this.log(`TS Error: ${line.trim()}`, 'error'));
            }
          } else if (error.code === 127) {
            this.log('TypeScript not installed or not found', 'warning');
          } else {
            this.log(`TypeScript check failed: ${error.message}`, 'error');
          }
        } else {
          this.log('TypeScript compilation successful', 'success');
        }
        resolve();
      });
    });
  }

  async runEslintCheck() {
    this.log('Running ESLint check...');
    
    return new Promise((resolve) => {
      exec('npx next lint --max-warnings 0', { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          if (error.code === 1) {
            this.log('ESLint found issues', 'warning');
          } else {
            this.log('ESLint check failed or not configured', 'warning');
          }
        } else {
          this.log('ESLint check passed', 'success');
        }
        resolve();
      });
    });
  }

  checkForCommonIssues() {
    this.log('Checking for common issues...');
    
    // Check for missing key props in React components
    const tsxFiles = this.findFiles('.', ['.tsx'], ['node_modules', '.next']);
    let mapWithoutKeyCount = 0;
    
    tsxFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const mapMatches = content.match(/\.map\s*\([^)]*=>\s*<[^>]*>/g);
        if (mapMatches) {
          mapMatches.forEach(match => {
            if (!match.includes('key=')) {
              mapWithoutKeyCount++;
            }
          });
        }
      } catch (error) {
        // Ignore file read errors
      }
    });

    if (mapWithoutKeyCount > 0) {
      this.log(`Found ${mapWithoutKeyCount} potential missing React keys`, 'warning');
    } else {
      this.log('No obvious missing React keys found', 'success');
    }
  }

  findFiles(dir, extensions, excludeDirs = []) {
    let files = [];
    
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          if (!excludeDirs.some(exclude => item.name.includes(exclude))) {
            files = files.concat(this.findFiles(fullPath, extensions, excludeDirs));
          }
        } else if (extensions.some(ext => item.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore directory read errors
    }
    
    return files;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.passed.length + this.warnings.length + this.issues.length,
        passed: this.passed.length,
        warnings: this.warnings.length,
        errors: this.issues.length,
        ready: this.issues.length === 0
      },
      passed: this.passed,
      warnings: this.warnings,
      errors: this.issues
    };

    fs.writeFileSync('pre-build-check-report.json', JSON.stringify(report, null, 2));
    return report;
  }

  printSummary(report) {
    console.log('\n🚀 PRE-BUILD CHECK SUMMARY');
    console.log('============================');
    console.log(`Total Checks: ${report.summary.total}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`❌ Errors: ${report.summary.errors}`);
    console.log(`Build Ready: ${report.summary.ready ? '✅ YES' : '❌ NO'}`);

    if (report.summary.errors > 0) {
      console.log('\n❌ CRITICAL ISSUES TO FIX:');
      report.errors.slice(0, 5).forEach(error => {
        console.log(`  • ${error.message}`);
      });
    }

    if (report.summary.warnings > 0) {
      console.log('\n⚠️  WARNINGS TO CONSIDER:');
      report.warnings.slice(0, 3).forEach(warning => {
        console.log(`  • ${warning.message}`);
      });
    }

    console.log('\n📄 Full report saved to: pre-build-check-report.json');
  }

  async run() {
    console.log('🔍 Starting comprehensive pre-build check...\n');
    
    // File system checks
    this.checkPackageJson();
    this.checkNextConfig();
    this.checkTSConfig();
    this.checkEnvironmentFiles();
    this.checkCriticalDirectories();
    
    // Code quality checks
    await this.runTypeScriptCheck();
    await this.runEslintCheck();
    this.checkForCommonIssues();
    
    const report = this.generateReport();
    this.printSummary(report);
    
    return report;
  }
}

// Run the pre-build check
const checker = new PreBuildChecker();
checker.run().then(report => {
  process.exit(report.summary.errors > 0 ? 1 : 0);
}).catch(error => {
  console.error('❌ Pre-build check failed:', error);
  process.exit(1);
});
