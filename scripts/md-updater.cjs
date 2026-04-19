/**
 * Custom updater for standard-version to handle Markdown files.
 * It doesn't actually modify the content (our sync-version script does that),
 * but it allows standard-version to track these files in the release commit.
 */
module.exports.readVersion = function (contents) {
  // We don't really care about the internal version of the MD file
  // as package.json is the source of truth.
  return '0.0.0'; 
};

module.exports.writeVersion = function (contents, version) {
  // We return the contents as-is. 
  // The actual synchronization happens in the "version" hook 
  // which runs just after the bump phase.
  return contents;
};
