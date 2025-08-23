import React from 'react';
import { VERSION_INFO } from '../version';

const VersionInfo: React.FC = () => {
  return (
    <div className="version-info">
      <div className="version-container">
        <div className="version-main">
          <span className="version-text">Version v{VERSION_INFO.version} — {VERSION_INFO.buildDate}</span>
        </div>
        <div className="version-copyright">
          <span className="copyright-text">© 2025 WeTrio. Proprietary software. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

export default VersionInfo;
