const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Get the last commit information
function getLastCommitInfo() {
  try {
    // Get commit hash
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().substring(0, 8);
    
    // Get commit date
    const commitDate = execSync('git log -1 --format=%cd --date=short', { encoding: 'utf8' }).trim();
    
    // Get total number of commits
    const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
    
    return {
      hash: commitHash,
      date: commitDate,
      count: parseInt(commitCount, 10)
    };
  } catch (error) {
    console.error('Error getting git information:', error.message);
    return {
      hash: 'unknown',
      date: new Date().toISOString().split('T')[0],
      count: 0
    };
  }
}

// Calculate version based on commit count
function calculateVersion(commitCount) {
  const major = 1;
  const minor = Math.floor(commitCount / 100);
  const patch = commitCount % 100;
  return `v${major}.${minor}.${patch}`;
}

// Update version.ts file
function updateVersionFile(commitInfo) {
  const version = calculateVersion(commitInfo.count);
  const versionFilePath = path.join(__dirname, '..', 'src', 'version.ts');
  
  const versionContent = `// Version information - Auto-generated from git
export const APP_VERSION = '${version}';
export const BUILD_DATE = '${commitInfo.date}';
export const COMMIT_HASH = '${commitInfo.hash}';

// Get commit number from environment or calculate from hash
function getCommitNumber(): number {
  const commitNumber = process.env.REACT_APP_COMMIT_NUMBER;
  if (commitNumber) {
    return parseInt(commitNumber, 10);
  }
  
  // Fallback: try to extract from hash or use timestamp
  if (COMMIT_HASH && COMMIT_HASH.length >= 4) {
    // Use first 4 characters of hash as number (hex to decimal)
    const hashPart = COMMIT_HASH.substring(0, 4);
    return parseInt(hashPart, 16);
  }
  
  // Last resort: use timestamp
  return Math.floor(Date.now() / 1000000) % 10000;
}

// Calculate version based on commit number
function calculateVersion(commitNumber: number): string {
  const major = 1;
  const minor = Math.floor(commitNumber / 100);
  const patch = commitNumber % 100;
  return \`\${major}.\${minor}.\${patch}\`;
}

const COMMIT_NUMBER = getCommitNumber();
const DYNAMIC_VERSION = calculateVersion(COMMIT_NUMBER);

// Version details
export const VERSION_INFO = {
  version: DYNAMIC_VERSION,
  buildDate: BUILD_DATE,
  commitHash: COMMIT_HASH,
  commitNumber: COMMIT_NUMBER,
  features: [
    'Dynamic pricing system with progressive discounts',
    'Hourly rate calculations for UI/UX and Delegated Support',
    'Discount system (5%, 10%, 15%)',
    'Estimated hours calculation',
    'Regional pricing adjustments',
    'Urgency multipliers (1 day +50%, 3 days +30%)',
    'Copy to clipboard functionality',
    'Responsive design for mobile and desktop'
  ],
  lastUpdate: BUILD_DATE
};
`;

  try {
    fs.writeFileSync(versionFilePath, versionContent, 'utf8');
    console.log(`✅ Version updated: ${version} — ${commitInfo.date}`);
    console.log(`📝 Commit hash: ${commitInfo.hash}`);
    console.log(`🔢 Commit count: ${commitInfo.count}`);
  } catch (error) {
    console.error('Error updating version file:', error.message);
  }
}

// Main execution
if (require.main === module) {
  const commitInfo = getLastCommitInfo();
  updateVersionFile(commitInfo);
}

module.exports = { getLastCommitInfo, calculateVersion, updateVersionFile };
