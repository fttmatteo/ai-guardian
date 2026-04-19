const fs = require('fs');
const path = require('path');

// 1. Get version from package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version; // e.g. "1.0.0"

// 2. Define maintenance version (e.g. 1.0.x)
const versionParts = version.split('.');
const maintenanceVersion = `${versionParts[0]}.${versionParts[1]}.x`;

console.log(`🚀 AI Guardian: Syncing version ${version} (maintenance: ${maintenanceVersion})...`);

// Files to update
const files = [
  'README.md',
  'README.en.md',
  'SECURITY.md',
  'SECURITY.en.md'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Update Badge (shields.io)
  // Pattern: Version-1.0.0-blue or Versión-1.0.0-blue
  const badgeRegex = /img\.shields\.io\/badge\/(?:Versi[óo]n|Version)-[\d.]+-blue\.svg/g;
  const newBadgeName = file.includes('.en') ? 'Version' : 'Versión';
  const newBadge = `img.shields.io/badge/${newBadgeName}-${version}-blue.svg`;
  content = content.replace(badgeRegex, newBadge);

  // Update Security Table (e.g. | v1.0.x | :white_check_mark: |)
  // We target the first row of the table after the header
  const securityRegex = /\|\s*(v?[\d.x<>]+)\s*\|\s*(✅|❌|:white_check_mark:|:x:)\s*(?:Sí|S|Yes|No)?\s*\|/g;
  // We only want to replace the first occurrence (current version)
  let found = false;
  content = content.replace(securityRegex, (match, v, icon) => {
    if (!found && v.includes('.x')) {
      found = true;
      const mark = ':white_check_mark:'; // Using standard versioning mark
      const prefix = v.startsWith('v') ? 'v' : '';
      return `| ${prefix}${maintenanceVersion} | ${mark} |`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${file}`);
});

console.log('✨ All documentation files synchronized.');
