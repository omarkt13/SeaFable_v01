
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class CompilationDiagnostics {
  constructor() {
    this.issues = [];
    this.searchPatterns = {
      // TypeScript compilation issues
      typeErrors: [
        /Type '.+' is not assignable to type '.+'/g,
        /Property '.+' does not exist on type '.+'/g,
        /Cannot find name '.+'/g,
        /Expected .+ arguments, but got .+/g,
        /'[^']+' is declared but its value is never read/g,
        /Variable '.+' is used before being assigned/g,
      ],
      
      // Import/Export issues
      importErrors: [
        /Cannot find module '.+'/g,
        /Module '".+"' has no exported member '.+'/g,
        /Cannot resolve dependency '.+'/g,
        /Import '.+' conflicts with local declaration/g,
      ],
      
      // React/JSX issues
      reactErrors: [
        /JSX element '.+' has no corresponding closing tag/g,
        /Property '.+' is missing in type/g,
        /React Hook .+ is called conditionally/g,
        /React Hook .+ cannot be called inside a callback/g,
        /Each child in a list should have a unique "key" prop/g,
      ],
      
      // Next.js specific issues
      nextjsErrors: [
        /Error: .+ is not a valid .+ component export/g,
        /Dynamic server usage: .+ is not allowed/g,
        /Hydration failed because the server rendered HTML/g,
      ],
      
      // Syntax errors
      syntaxErrors: [
        /Unexpected token/g,
        /Unterminated string literal/g,
        /Missing closing bracket/g,
        /Unexpected end of input/g,
        /Invalid or unexpected token/g,
      ]
    };
  }

  async scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Check for common compilation patterns
      this.checkImportPatterns(content, relativePath);
      this.checkTypeScriptPatterns(content, relativePath);
      this.checkReactPatterns(content, relativePath);
      this.checkSyntaxPatterns(content, relativePath);
      
    } catch (error) {
      this.issues.push({
        type: 'file_access_error',
        file: filePath,
        message: `Cannot read file: ${error.message}`,
        severity: 'high'
      });
    }
  }

  checkImportPatterns(content, filePath) {
    // Mixed quote styles in imports
    const importLines = content.match(/^import.*from.*/gm) || [];
    let singleQuotes = 0, doubleQuotes = 0;
    
    importLines.forEach((line, index) => {
      if (line.includes("'")) singleQuotes++;
      if (line.includes('"')) doubleQuotes++;
      
      // Check for missing file extensions in relative imports
      if (line.match(/from\s+['"]\..*[^'"]\s*['"]/) && !line.includes('.ts') && !line.includes('.tsx') && !line.includes('.js') && !line.includes('.jsx')) {
        this.issues.push({
          type: 'import_missing_extension',
          file: filePath,
          line: index + 1,
          message: `Relative import may be missing file extension: ${line.trim()}`,
          severity: 'medium'
        });
      }
    });

    if (singleQuotes > 0 && doubleQuotes > 0) {
      this.issues.push({
        type: 'import_quote_inconsistency',
        file: filePath,
        message: `Mixed quote styles in imports (${singleQuotes} single, ${doubleQuotes} double)`,
        severity: 'low'
      });
    }

    // Check for circular imports (basic detection)
    const imports = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
    imports.forEach(imp => {
      const modulePath = imp.match(/from\s+['"]([^'"]+)['"]/)[1];
      if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
        // This would need more sophisticated analysis for full circular detection
      }
    });
  }

  checkTypeScriptPatterns(content, filePath) {
    // Check for any usage without proper typing
    const anyUsage = content.match(/:\s*any\b/g);
    if (anyUsage && anyUsage.length > 0) {
      this.issues.push({
        type: 'typescript_any_usage',
        file: filePath,
        message: `Found ${anyUsage.length} usage(s) of 'any' type`,
        severity: 'medium'
      });
    }

    // Check for non-null assertions without proper checking
    const nonNullAssertions = content.match(/!\s*\./g);
    if (nonNullAssertions && nonNullAssertions.length > 0) {
      this.issues.push({
        type: 'typescript_non_null_assertion',
        file: filePath,
        message: `Found ${nonNullAssertions.length} non-null assertion(s) - potential runtime errors`,
        severity: 'medium'
      });
    }

    // Check for missing return types on functions
    const functionMatches = content.match(/function\s+\w+\([^)]*\)\s*\{/g);
    if (functionMatches) {
      functionMatches.forEach(func => {
        if (!func.includes(':')) {
          this.issues.push({
            type: 'typescript_missing_return_type',
            file: filePath,
            message: `Function missing return type: ${func.trim()}`,
            severity: 'low'
          });
        }
      });
    }
  }

  checkReactPatterns(content, filePath) {
    if (!filePath.includes('.tsx') && !filePath.includes('.jsx')) return;

    // Check for missing keys in map operations
    const mapOperations = content.match(/\.map\s*\([^)]*=>\s*<[^>]+>/g);
    if (mapOperations) {
      mapOperations.forEach(map => {
        if (!map.includes('key=')) {
          this.issues.push({
            type: 'react_missing_key',
            file: filePath,
            message: `Map operation missing key prop: ${map.substring(0, 50)}...`,
            severity: 'medium'
          });
        }
      });
    }

    // Check for incorrect hook usage
    const conditionalHooks = content.match(/if\s*\([^)]*\)\s*{[^}]*use\w+/g);
    if (conditionalHooks) {
      this.issues.push({
        type: 'react_conditional_hooks',
        file: filePath,
        message: `Potential conditional hook usage detected`,
        severity: 'high'
      });
    }

    // Check for useState with object without proper typing
    const useStateMatches = content.match(/useState\s*\(\s*\{[^}]*\}/g);
    if (useStateMatches) {
      useStateMatches.forEach(useState => {
        if (!useState.includes('<') || !useState.includes('>')) {
          this.issues.push({
            type: 'react_untyped_state',
            file: filePath,
            message: `useState with object should be properly typed`,
            severity: 'medium'
          });
        }
      });
    }
  }

  checkSyntaxPatterns(content, filePath) {
    // Check for unclosed brackets
    const openBrackets = (content.match(/\{/g) || []).length;
    const closeBrackets = (content.match(/\}/g) || []).length;
    if (openBrackets !== closeBrackets) {
      this.issues.push({
        type: 'syntax_unmatched_brackets',
        file: filePath,
        message: `Unmatched brackets: ${openBrackets} open, ${closeBrackets} close`,
        severity: 'high'
      });
    }

    // Check for stray markdown markers
    if (content.includes('```')) {
      this.issues.push({
        type: 'syntax_stray_markdown',
        file: filePath,
        message: `Stray markdown code block markers found`,
        severity: 'high'
      });
    }

    // Check for console.log statements
    const consoleLogs = content.match(/console\.log\s*\(/g);
    if (consoleLogs && consoleLogs.length > 0) {
      this.issues.push({
        type: 'syntax_console_log',
        file: filePath,
        message: `Found ${consoleLogs.length} console.log statement(s) - remove for production`,
        severity: 'low'
      });
    }
  }

  async scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        await this.scanDirectory(fullPath, extensions);
      } else if (file.isFile() && extensions.some(ext => file.name.endsWith(ext))) {
        await this.scanFile(fullPath);
      }
    }
  }

  async runTypeScriptCheck() {
    return new Promise((resolve) => {
      exec('npx tsc --noEmit --pretty false', (error, stdout, stderr) => {
        if (error || stderr) {
          const output = stderr || stdout || error.message;
          const lines = output.split('\n').filter(line => line.trim());
          
          lines.forEach(line => {
            if (line.includes('error TS')) {
              const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/);
              if (match) {
                this.issues.push({
                  type: 'typescript_compilation_error',
                  file: match[1],
                  line: parseInt(match[2]),
                  column: parseInt(match[3]),
                  code: match[4],
                  message: match[5],
                  severity: 'high'
                });
              }
            }
          });
        }
        resolve();
      });
    });
  }

  async runLintCheck() {
    return new Promise((resolve) => {
      exec('npx next lint --format=json', (error, stdout, stderr) => {
        if (stdout) {
          try {
            const lintResults = JSON.parse(stdout);
            lintResults.forEach(result => {
              if (result.messages) {
                result.messages.forEach(message => {
                  this.issues.push({
                    type: 'eslint_error',
                    file: result.filePath,
                    line: message.line,
                    column: message.column,
                    message: message.message,
                    rule: message.ruleId,
                    severity: message.severity === 2 ? 'high' : 'medium'
                  });
                });
              }
            });
          } catch (e) {
            // Lint output might not be JSON
          }
        }
        resolve();
      });
    });
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.issues.length,
        high: this.issues.filter(i => i.severity === 'high').length,
        medium: this.issues.filter(i => i.severity === 'medium').length,
        low: this.issues.filter(i => i.severity === 'low').length
      },
      issues: this.issues.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      })
    };

    fs.writeFileSync('compilation-diagnostics-report.json', JSON.stringify(report, null, 2));
    return report;
  }

  printSummary(report) {
    console.log('\n🔍 COMPILATION DIAGNOSTICS REPORT');
    console.log('=====================================');
    console.log(`Total Issues Found: ${report.summary.total}`);
    console.log(`High Priority: ${report.summary.high}`);
    console.log(`Medium Priority: ${report.summary.medium}`);
    console.log(`Low Priority: ${report.summary.low}`);

    if (report.summary.high > 0) {
      console.log('\n🚨 HIGH PRIORITY ISSUES:');
      report.issues.filter(i => i.severity === 'high').slice(0, 10).forEach(issue => {
        console.log(`  • ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
        console.log(`    ${issue.message}`);
      });
    }

    if (report.summary.medium > 0) {
      console.log('\n⚠️  MEDIUM PRIORITY ISSUES:');
      report.issues.filter(i => i.severity === 'medium').slice(0, 5).forEach(issue => {
        console.log(`  • ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
        console.log(`    ${issue.message}`);
      });
    }

    console.log('\n📄 Full report saved to: compilation-diagnostics-report.json');
  }

  async run() {
    console.log('🔍 Starting comprehensive compilation diagnostics...');
    
    // Scan all TypeScript/JavaScript files
    await this.scanDirectory('./app');
    await this.scanDirectory('./components');
    await this.scanDirectory('./lib');
    await this.scanDirectory('./hooks');
    await this.scanDirectory('./types');
    
    // Run TypeScript compiler check
    console.log('🔧 Running TypeScript compilation check...');
    await this.runTypeScriptCheck();
    
    // Run ESLint check
    console.log('🔧 Running ESLint check...');
    await this.runLintCheck();
    
    const report = this.generateReport();
    this.printSummary(report);
    
    return report;
  }
}

// Run the diagnostics
const diagnostics = new CompilationDiagnostics();
diagnostics.run().then(report => {
  process.exit(report.summary.high > 0 ? 1 : 0);
}).catch(error => {
  console.error('❌ Diagnostics failed:', error);
  process.exit(1);
});
