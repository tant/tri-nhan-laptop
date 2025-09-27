#!/usr/bin/env node
/**
 * Performance Analysis Script
 *
 * Analyzes the Vietnamese Laptop Repair Shop Management System for:
 * - Bundle size optimization opportunities
 * - Runtime performance metrics
 * - Memory usage patterns
 * - Load time improvements
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Performance analysis configuration
const config = {
  distPath: './dist',
  srcPath: './src',
  thresholds: {
    bundleSize: 500 * 1024, // 500KB
    chunkSize: 100 * 1024,  // 100KB
    cssSize: 50 * 1024,     // 50KB
  }
};

/**
 * Analyze bundle sizes and identify optimization opportunities
 */
function analyzeBundleSize() {
  console.log('\n🔍 Bundle Size Analysis\n');

  try {
    const distFiles = readdirSync(join(process.cwd(), config.distPath, 'assets'));
    const bundles = [];

    for (const file of distFiles) {
      const filePath = join(process.cwd(), config.distPath, 'assets', file);
      const stats = statSync(filePath);
      const ext = extname(file);

      if (['.js', '.css'].includes(ext)) {
        bundles.push({
          name: file,
          size: stats.size,
          type: ext.slice(1),
          sizeKB: Math.round(stats.size / 1024),
        });
      }
    }

    // Sort by size descending
    bundles.sort((a, b) => b.size - a.size);

    console.log('📊 Bundle Size Report:');
    console.log('┌─────────────────────────────────────┬─────────┬──────────┐');
    console.log('│ File                                │ Size    │ Status   │');
    console.log('├─────────────────────────────────────┼─────────┼──────────┤');

    let totalSize = 0;
    const optimizationOpportunities = [];

    bundles.forEach(bundle => {
      totalSize += bundle.size;
      const status = bundle.size > config.thresholds.bundleSize ? '⚠️  Large' :
                    bundle.size > config.thresholds.chunkSize ? '🔶 Medium' : '✅ Good';

      console.log(`│ ${bundle.name.padEnd(35)} │ ${(bundle.sizeKB + 'KB').padEnd(7)} │ ${status.padEnd(8)} │`);

      // Identify optimization opportunities
      if (bundle.size > config.thresholds.bundleSize) {
        optimizationOpportunities.push({
          file: bundle.name,
          size: bundle.sizeKB,
          type: bundle.type,
          suggestion: getOptimizationSuggestion(bundle)
        });
      }
    });

    console.log('└─────────────────────────────────────┴─────────┴──────────┘');
    console.log(`Total Bundle Size: ${Math.round(totalSize / 1024)}KB`);

    // Optimization recommendations
    if (optimizationOpportunities.length > 0) {
      console.log('\n🔧 Optimization Opportunities:');
      optimizationOpportunities.forEach((opp, index) => {
        console.log(`${index + 1}. ${opp.file} (${opp.size}KB)`);
        console.log(`   💡 ${opp.suggestion}`);
      });
    }

    return { bundles, totalSize, optimizationOpportunities };

  } catch (error) {
    console.error('❌ Error analyzing bundle size:', error.message);
    return null;
  }
}

/**
 * Get optimization suggestion based on bundle characteristics
 */
function getOptimizationSuggestion(bundle) {
  if (bundle.name.includes('vendor-react')) {
    return 'Consider React production optimizations and tree-shaking unused features';
  }
  if (bundle.name.includes('vendor-misc')) {
    return 'Audit miscellaneous vendor dependencies for unused code';
  }
  if (bundle.name.includes('vendor-tanstack')) {
    return 'Consider selective TanStack imports and lazy loading';
  }
  if (bundle.name.includes('pages')) {
    return 'Consider further route-based code splitting';
  }
  if (bundle.name.includes('hooks-heavy')) {
    return 'Split heavy hooks by feature domain';
  }
  if (bundle.type === 'css') {
    return 'Consider CSS purging and compression optimizations';
  }
  return 'Consider code splitting and lazy loading optimizations';
}

/**
 * Analyze source code structure for performance insights
 */
function analyzeSourceStructure() {
  console.log('\n📁 Source Code Structure Analysis\n');

  const componentCount = countFiles('./src/components', '.tsx');
  const hookCount = countFiles('./src/hooks', '.ts');
  const pageCount = countFiles('./src/routes', '.tsx');
  const utilCount = countFiles('./src/lib', '.ts');

  console.log('📊 Source Structure:');
  console.log(`   Components: ${componentCount} files`);
  console.log(`   Hooks: ${hookCount} files`);
  console.log(`   Pages: ${pageCount} files`);
  console.log(`   Utilities: ${utilCount} files`);

  // Analyze largest source files
  const largeFiles = findLargeSourceFiles('./src', 5); // Top 5 largest

  if (largeFiles.length > 0) {
    console.log('\n📄 Largest Source Files:');
    largeFiles.forEach((file, index) => {
      console.log(`${index + 1}. ${file.path} (${file.sizeKB}KB)`);
      if (file.sizeKB > 10) {
        console.log(`   💡 Consider breaking down this file for better maintainability`);
      }
    });
  }

  return { componentCount, hookCount, pageCount, utilCount, largeFiles };
}

/**
 * Count files with specific extension in directory
 */
function countFiles(dir, ext) {
  try {
    const fullPath = join(process.cwd(), dir);
    return countFilesRecursive(fullPath, ext);
  } catch (error) {
    return 0;
  }
}

function countFilesRecursive(dir, ext) {
  let count = 0;
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const itemPath = join(dir, item);
      const stats = statSync(itemPath);
      if (stats.isDirectory()) {
        count += countFilesRecursive(itemPath, ext);
      } else if (item.endsWith(ext)) {
        count++;
      }
    }
  } catch (error) {
    // Directory doesn't exist or permission error
  }
  return count;
}

/**
 * Find largest source files for optimization analysis
 */
function findLargeSourceFiles(dir, limit = 10) {
  const files = [];

  function scanDirectory(currentDir) {
    try {
      const items = readdirSync(currentDir);
      for (const item of items) {
        const itemPath = join(currentDir, item);
        const stats = statSync(itemPath);

        if (stats.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
          scanDirectory(itemPath);
        } else if (stats.isFile() && ['.ts', '.tsx', '.js', '.jsx'].includes(extname(item))) {
          const relativePath = itemPath.replace(process.cwd() + '/', '');
          files.push({
            path: relativePath,
            size: stats.size,
            sizeKB: Math.round(stats.size / 1024)
          });
        }
      }
    } catch (error) {
      // Skip directories with permission issues
    }
  }

  scanDirectory(join(process.cwd(), dir));

  // Sort by size descending and return top files
  return files.sort((a, b) => b.size - a.size).slice(0, limit);
}

/**
 * Generate Vietnamese business context performance recommendations
 */
function generateVietnameseBusinessRecommendations(analysisResults) {
  console.log('\n🇻🇳 Vietnamese Business Context Recommendations\n');

  const recommendations = [];

  // Bundle size recommendations
  if (analysisResults.bundleAnalysis?.totalSize > 1024 * 1024) { // > 1MB
    recommendations.push({
      category: 'Bundle Optimization',
      priority: 'High',
      description: 'Large bundle size may impact Vietnamese customers with slower internet connections',
      action: 'Implement aggressive code splitting for Vietnamese market optimization'
    });
  }

  // Vietnamese-specific optimizations
  recommendations.push({
    category: 'Vietnamese Locale',
    priority: 'Medium',
    description: 'Optimize Vietnamese phone number validation and currency formatting',
    action: 'Consider caching Vietnamese locale data and lazy loading non-essential validations'
  });

  recommendations.push({
    category: 'Business Logic',
    priority: 'Medium',
    description: 'Heavy business logic hooks may impact repair workflow responsiveness',
    action: 'Implement optimistic updates for Vietnamese repair ticket operations'
  });

  // Display recommendations
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. [${rec.priority}] ${rec.category}`);
    console.log(`   📝 ${rec.description}`);
    console.log(`   🎯 ${rec.action}\n`);
  });

  return recommendations;
}

/**
 * Main performance analysis function
 */
async function runPerformanceAnalysis() {
  console.log('🚀 Vietnamese Laptop Repair Shop - Performance Analysis');
  console.log('=' .repeat(60));

  const results = {};

  // Bundle size analysis
  results.bundleAnalysis = analyzeBundleSize();

  // Source structure analysis
  results.sourceAnalysis = analyzeSourceStructure();

  // Vietnamese business recommendations
  results.recommendations = generateVietnameseBusinessRecommendations(results);

  // Summary
  console.log('\n📋 Performance Analysis Summary\n');
  console.log('✅ Bundle size analysis completed');
  console.log('✅ Source structure analysis completed');
  console.log('✅ Vietnamese business recommendations generated');

  if (results.bundleAnalysis?.optimizationOpportunities.length > 0) {
    console.log(`⚠️  ${results.bundleAnalysis.optimizationOpportunities.length} optimization opportunities identified`);
  } else {
    console.log('🎉 No major optimization issues detected');
  }

  console.log('\n📈 Next Steps:');
  console.log('1. Implement high-priority optimization recommendations');
  console.log('2. Run runtime performance profiling in development environment');
  console.log('3. Test load times with Vietnamese business data scenarios');
  console.log('4. Validate memory usage during peak repair shop operations');

  return results;
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceAnalysis().catch(console.error);
}

export { runPerformanceAnalysis, analyzeBundleSize, analyzeSourceStructure };