// Version information - Auto-generated from git
export const APP_VERSION = 'v1.0.37';
export const BUILD_DATE = '2025-08-30';
export const COMMIT_HASH = 'b9d5b16f';

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
  return `${major}.${minor}.${patch}`;
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
