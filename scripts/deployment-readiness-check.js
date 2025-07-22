
const fs = require('fs');
const path = require('path');

class DeploymentReadinessChecker {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  log(type, message, details = null) {
    const entry = { message, details, timestamp: new Date().toISOString() };
    this.results[type].push(entry);
    
    const colors = {
      passed: '\x1b[32m✅',
      failed: '\x1b[31m❌',
      warnings: '\x1b[33m⚠️'
    };
    
    console.log(`${colors[type]} ${message}\x1b[0m`);
    if (details) console.log(`   ${details}`);
  }

  checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.log('passed', `${description} exists`);
      return true;
    } else {
      this.log('failed', `${description} missing`, `File: ${filePath}`);
      return false;
    }
  }

  checkEnvironmentConfig() {
    console.log('\n🔧 Environment Configuration');
    
    // Check for environment files
    this.checkFileExists('.env.example', 'Environment template');
    
    // Check Next.js config
    if (this.checkFileExists('next.config.mjs', 'Next.js configuration')) {
      try {
        const config = fs.readFileSync('next.config.mjs', 'utf8');
        
        if (config.includes('unoptimized: true')) {
          this.log('passed', 'Images configured for static deployment');
        }
        
        if (config.includes('removeConsole')) {
          this.log('passed', 'Console removal configured for production');
        }
        
        if (config.includes('allowedDevOrigins')) {
          this.log('passed', 'Replit dev origins configured');
        }
      } catch (error) {
        this.log('failed', 'Error reading Next.js config', error.message);
      }
    }
  }

  checkDependencies() {
    console.log('\n📦 Dependencies');
    
    if (this.checkFileExists('package.json', 'Package configuration')) {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Check essential scripts
        const requiredScripts = ['build', 'start', 'dev'];
        requiredScripts.forEach(script => {
          if (packageJson.scripts && packageJson.scripts[script]) {
            this.log('passed', `Script "${script}" defined`);
          } else {
            this.log('failed', `Script "${script}" missing`);
          }
        });
        
        // Check for security dependencies
        const securityDeps = ['isomorphic-dompurify', 'bcryptjs'];
        securityDeps.forEach(dep => {
          if (packageJson.dependencies && packageJson.dependencies[dep]) {
            this.log('passed', `Security dependency "${dep}" installed`);
          } else {
            this.log('warnings', `Security dependency "${dep}" missing`);
          }
        });
        
        // Check for essential dependencies
        const essentialDeps = ['next', 'react', '@supabase/supabase-js'];
        essentialDeps.forEach(dep => {
          if (packageJson.dependencies && packageJson.dependencies[dep]) {
            this.log('passed', `Essential dependency "${dep}" installed`);
          } else {
            this.log('failed', `Essential dependency "${dep}" missing`);
          }
        });
        
      } catch (error) {
        this.log('failed', 'Error reading package.json', error.message);
      }
    }
  }

  checkDatabaseSchema() {
    console.log('\n🗄️ Database Schema');
    
    const migrationFiles = [
      '13-business-portal-tables.sql',
      '18-expand-activity-types.sql',
      '19-seed-expanded-activities.sql'
    ];
    
    migrationFiles.forEach(file => {
      this.checkFileExists(`scripts/${file}`, `Migration: ${file}`);
    });
  }

  checkAPIEndpoints() {
    console.log('\n🔌 API Endpoints');
    
    const criticalEndpoints = [
      'app/api/business/dashboard/route.ts',
      'app/api/business/experiences/route.ts',
      'app/api/business/availability/route.ts',
      'app/api/activities/[type]/route.ts'
    ];
    
    criticalEndpoints.forEach(endpoint => {
      const description = `API: ${path.basename(path.dirname(endpoint))}`;
      this.checkFileExists(endpoint, description);
    });
  }

  checkAuthenticationSystem() {
    console.log('\n🔐 Authentication System');
    
    const authFiles = [
      'lib/auth-context.tsx',
      'lib/auth-utils.ts',
      'components/auth/BusinessProtectedRoute.tsx',
      'components/auth/CustomerProtectedRoute.tsx'
    ];
    
    authFiles.forEach(file => {
      this.checkFileExists(file, `Auth: ${path.basename(file)}`);
    });
  }

  checkBusinessPortal() {
    console.log('\n🏢 Business Portal');
    
    const businessPages = [
      'app/business/home/page.tsx',
      'app/business/experiences/page.tsx',
      'app/business/bookings/page.tsx',
      'app/business/settings/page.tsx'
    ];
    
    businessPages.forEach(page => {
      const pageName = path.basename(path.dirname(page));
      this.checkFileExists(page, `Business page: ${pageName}`);
    });
    
    this.checkFileExists('components/layouts/BusinessLayout.tsx', 'Business layout component');
  }

  checkSecurityFeatures() {
    console.log('\n🛡️ Security Features');
    
    if (this.checkFileExists('lib/security.ts', 'Security utilities')) {
      try {
        const securityCode = fs.readFileSync('lib/security.ts', 'utf8');
        
        if (securityCode.includes('sanitize')) {
          this.log('passed', 'Input sanitization implemented');
        } else {
          this.log('warnings', 'Input sanitization may be missing');
        }
        
        if (securityCode.includes('rateLimit')) {
          this.log('passed', 'Rate limiting implemented');
        } else {
          this.log('warnings', 'Rate limiting may be missing');
        }
        
      } catch (error) {
        this.log('failed', 'Error reading security file', error.message);
      }
    }
  }

  checkTypeScript() {
    console.log('\n📝 TypeScript Configuration');
    
    if (this.checkFileExists('tsconfig.json', 'TypeScript configuration')) {
      try {
        const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        
        if (tsconfig.compilerOptions?.strict) {
          this.log('passed', 'Strict TypeScript mode enabled');
        } else {
          this.log('warnings', 'Strict TypeScript mode not enabled');
        }
        
        if (tsconfig.compilerOptions?.paths) {
          this.log('passed', 'Path mapping configured');
        }
        
      } catch (error) {
        this.log('failed', 'Error reading TypeScript config', error.message);
      }
    }
  }

  checkUIComponents() {
    console.log('\n🎨 UI Components');
    
    const criticalComponents = [
      'components/ui/button.tsx',
      'components/ui/card.tsx',
      'components/ui/form.tsx',
      'components/ui/dialog.tsx'
    ];
    
    criticalComponents.forEach(component => {
      const componentName = path.basename(component, '.tsx');
      this.checkFileExists(component, `UI component: ${componentName}`);
    });
  }

  checkProductionOptimizations() {
    console.log('\n⚡ Production Optimizations');
    
    // Check for CSS optimization
    this.checkFileExists('tailwind.config.ts', 'Tailwind CSS configuration');
    this.checkFileExists('postcss.config.mjs', 'PostCSS configuration');
    
    // Check for build output optimization
    if (fs.existsSync('next.config.mjs')) {
      try {
        const config = fs.readFileSync('next.config.mjs', 'utf8');
        
        if (config.includes('gzipSize: true')) {
          this.log('passed', 'Gzip size reporting enabled');
        }
        
        if (config.includes('workerThreads: false')) {
          this.log('passed', 'Worker threads optimized for deployment');
        }
        
        if (config.includes('cpus: 1')) {
          this.log('passed', 'CPU usage optimized for deployment');
        }
        
      } catch (error) {
        this.log('warnings', 'Could not verify production optimizations');
      }
    }
  }

  generateReport() {
    console.log('\n📊 DEPLOYMENT READINESS REPORT');
    console.log('=' .repeat(50));
    
    const total = this.results.passed.length + this.results.failed.length + this.results.warnings.length;
    const passRate = ((this.results.passed.length / total) * 100).toFixed(1);
    
    console.log(`✅ Passed: ${this.results.passed.length}`);
    console.log(`❌ Failed: ${this.results.failed.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    
    console.log('\n🚀 DEPLOYMENT RECOMMENDATIONS:');
    
    if (this.results.failed.length === 0) {
      console.log('✅ Your application appears ready for deployment!');
      console.log('   Recommended deployment type: Autoscale (for web applications)');
      console.log('   Next steps: Configure environment variables and deploy');
    } else {
      console.log('❌ Critical issues found. Address failed checks before deploying.');
    }
    
    if (this.results.warnings.length > 0) {
      console.log('⚠️  Consider addressing warnings for optimal production performance.');
    }
    
    // Export detailed results
    fs.writeFileSync('deployment-readiness-report.json', JSON.stringify({
      summary: {
        total,
        passed: this.results.passed.length,
        failed: this.results.failed.length,
        warnings: this.results.warnings.length,
        passRate
      },
      details: this.results,
      generatedAt: new Date().toISOString()
    }, null, 2));
    
    console.log('\n📄 Detailed report saved to: deployment-readiness-report.json');
  }

  async runAllChecks() {
    console.log('🔍 SEAFABLE DEPLOYMENT READINESS CHECK');
    console.log('=' .repeat(50));
    
    this.checkEnvironmentConfig();
    this.checkDependencies();
    this.checkDatabaseSchema();
    this.checkAPIEndpoints();
    this.checkAuthenticationSystem();
    this.checkBusinessPortal();
    this.checkSecurityFeatures();
    this.checkTypeScript();
    this.checkUIComponents();
    this.checkProductionOptimizations();
    
    this.generateReport();
  }
}

// Run the check
const checker = new DeploymentReadinessChecker();
checker.runAllChecks();
