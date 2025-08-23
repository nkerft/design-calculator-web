const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get current commit number
function getCommitNumber() {
  try {
    // Get total number of commits in the repository
    const commitCount = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
    return parseInt(commitCount, 10);
  } catch (error) {
    console.log('Could not get commit count, using timestamp fallback');
    return Math.floor(Date.now() / 1000000) % 10000;
  }
}

// Get current commit hash
function getCommitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'dev';
  }
}

// Calculate version based on commit number
function calculateVersion(commitNumber) {
  const major = 1;
  const minor = Math.floor(commitNumber / 100);
  const patch = commitNumber % 100;
  return `${major}.${minor}.${patch}`;
}

// Get current values
const commitNumber = getCommitNumber();
const commitHash = getCommitHash();
const newVersion = calculateVersion(commitNumber);
const buildDate = new Date().toISOString().split('T')[0];

// Update package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

// Update version.ts
const versionPath = path.join(__dirname, '..', 'src', 'version.ts');
const versionContent = `// Version information
export const APP_VERSION = '${newVersion}';
export const BUILD_DATE = '${buildDate}';
export const COMMIT_HASH = '${commitHash}';

// Get commit number from environment or calculate from hash
function getCommitNumber(): number {
  const commitNumber = process.env.REACT_APP_COMMIT_NUMBER;
  if (commitNumber) {
    return parseInt(commitNumber, 10);
  }
  
  // Fallback: try to extract from hash or use timestamp
  if (COMMIT_HASH && COMMIT_HASH !== 'dev') {
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

fs.writeFileSync(versionPath, versionContent);

console.log(`Version updated to ${newVersion} (commit #${commitNumber}, hash: ${commitHash})`);
