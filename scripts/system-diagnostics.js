
const { createClient } = require('@supabase/supabase-js');

// Test configuration
const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  testUserId: '4d5ece96-d2d9-451f-9553-374974154c3d', // Customer from logs
  testBusinessId: '6304ab11-3657-4e1c-b119-ab14115fbec1' // Business from logs
};

class SystemDiagnostics {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform
      },
      tests: {},
      summary: { passed: 0, failed: 0, warnings: 0 }
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(name, testFn) {
    this.log(`Running: ${name}`);
    try {
      const result = await testFn();
      this.results.tests[name] = { status: 'passed', ...result };
      this.results.summary.passed++;
      this.log(`${name}: PASSED`, 'success');
      return result;
    } catch (error) {
      this.results.tests[name] = { 
        status: 'failed', 
        error: error.message,
        stack: error.stack 
      };
      this.results.summary.failed++;
      this.log(`${name}: FAILED - ${error.message}`, 'error');
      return null;
    }
  }

  // Hypothesis 1: Test basic connectivity
  async testBasicConnectivity() {
    return this.runTest('Basic Database Connectivity', async () => {
      const supabase = createClient(config.supabaseUrl, config.supabaseKey);
      
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) throw error;
      
      return { 
        connectionStatus: 'active',
        responseTime: Date.now()
      };
    });
  }

  // Hypothesis 2: Test authentication systems
  async testAuthenticationSystems() {
    return this.runTest('Authentication Systems', async () => {
      const supabase = createClient(config.supabaseUrl, config.supabaseKey);
      
      // Test 1: Check if auth endpoint is responsive
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // Test 2: Test customer profile fetch
      const { data: customerData, error: customerError } = await supabase
        .from('users')
        .select('*')
        .eq('id', config.testUserId)
        .single();

      // Test 3: Test business profile fetch  
      const { data: businessData, error: businessError } = await supabase
        .from('host_profiles')
        .select('*')
        .eq('user_id', config.testBusinessId)
        .single();

      return {
        authEndpoint: !userError ? 'working' : 'failing',
        customerProfile: !customerError ? 'accessible' : 'inaccessible',
        businessProfile: !businessError ? 'accessible' : 'inaccessible',
        errors: {
          user: userError?.message,
          customer: customerError?.message,
          business: businessError?.message
        }
      };
    });
  }

  // Hypothesis 3: Test database table access
  async testDatabaseTables() {
    return this.runTest('Database Table Access', async () => {
      const supabase = createClient(config.supabaseUrl, config.supabaseKey);
      
      const tables = [
        'users',
        'host_profiles', 
        'experiences',
        'bookings',
        'reviews',
        'host_business_settings',
        'host_availability'
      ];

      const results = {};
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
            
          results[table] = {
            accessible: !error,
            recordCount: data?.length || 0,
            error: error?.message
          };
        } catch (err) {
          results[table] = {
            accessible: false,
            error: err.message
          };
        }
      }
      
      return { tables: results };
    });
  }

  // Hypothesis 4: Test relationship queries
  async testRelationshipQueries() {
    return this.runTest('Database Relationships', async () => {
      const supabase = createClient(config.supabaseUrl, config.supabaseKey);
      
      // Test 1: Experiences with host profiles
      const { data: expData, error: expError } = await supabase
        .from('experiences')
        .select(`
          *,
          host_profiles (
            id,
            name,
            avatar_url
          )
        `)
        .limit(1);

      // Test 2: Bookings with related data
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          experiences (title),
          users (first_name, last_name)
        `)
        .limit(1);

      return {
        experienceRelations: !expError,
        bookingRelations: !bookingError,
        errors: {
          experiences: expError?.message,
          bookings: bookingError?.message
        }
      };
    });
  }

  // Hypothesis 5: Test environment configuration
  async testEnvironmentConfig() {
    return this.runTest('Environment Configuration', async () => {
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
      ];

      const envStatus = {};
      for (const varName of requiredVars) {
        const value = process.env[varName];
        envStatus[varName] = {
          present: !!value,
          length: value?.length || 0,
          masked: value ? `${value.substring(0, 8)}...` : 'missing'
        };
      }

      // Test URL format
      const urlValid = config.supabaseUrl?.startsWith('https://') && 
                      config.supabaseUrl?.includes('.supabase.co');

      return {
        environmentVariables: envStatus,
        urlFormat: urlValid ? 'valid' : 'invalid',
        configComplete: requiredVars.every(v => process.env[v])
      };
    });
  }

  // Test connection pool behavior
  async testConnectionPool() {
    return this.runTest('Connection Pool Behavior', async () => {
      const supabase = createClient(config.supabaseUrl, config.supabaseKey);
      
      // Make multiple concurrent requests
      const requests = Array.from({ length: 5 }, (_, i) => 
        supabase.from('users').select('count').limit(1)
      );

      const startTime = Date.now();
      const results = await Promise.allSettled(requests);
      const endTime = Date.now();

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        concurrentRequests: 5,
        successful,
        failed,
        totalTime: endTime - startTime,
        avgTime: (endTime - startTime) / 5
      };
    });
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive system diagnostics...');
    
    await this.testBasicConnectivity();
    await this.testEnvironmentConfig(); 
    await this.testAuthenticationSystems();
    await this.testDatabaseTables();
    await this.testRelationshipQueries();
    await this.testConnectionPool();

    this.log(`\n📊 Summary: ${this.results.summary.passed} passed, ${this.results.summary.failed} failed, ${this.results.summary.warnings} warnings`);
    
    // Write detailed report
    require('fs').writeFileSync(
      'system-diagnostics-report.json', 
      JSON.stringify(this.results, null, 2)
    );
    
    this.log('📄 Detailed report saved to: system-diagnostics-report.json');
    
    return this.results;
  }
}

// Run diagnostics if called directly
if (require.main === module) {
  const diagnostics = new SystemDiagnostics();
  diagnostics.runAllTests().catch(console.error);
}

module.exports = SystemDiagnostics;
