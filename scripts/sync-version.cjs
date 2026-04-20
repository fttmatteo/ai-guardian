const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

const versionParts = version.split('.');
const maintenanceVersion = `${versionParts[0]}.${versionParts[1]}.x`;

console.log(`AI Guardian: Syncing version ${version} (maintenance: ${maintenanceVersion})...`);

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

  const badgeRegex = /img\.shields\.io\/badge\/(?:Versi[óo]n|Version)-[\d.]+-blue\.svg/g;
  const newBadgeName = file.includes('.en') ? 'Version' : 'Versión';
  const newBadge = `img.shields.io/badge/${newBadgeName}-${version}-blue.svg`;
  content = content.replace(badgeRegex, newBadge);

  const securityRegex = /\|\s*(v?[\d.x<>]+)\s*\|\s*(✅|❌|:white_check_mark:|:x:)\s*(?:Sí|S|Yes|No)?\s*\|/g;
  let found = false;
  content = content.replace(securityRegex, (match, v, icon) => {
    if (!found && v.includes('.x')) {
      found = true;
      const mark = ':white_check_mark:';
      const prefix = v.startsWith('v') ? 'v' : '';
      return `| ${prefix}${maintenanceVersion} | ${mark} |`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});

console.log('All documentation files synchronized.');
