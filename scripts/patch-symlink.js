const fs = require('fs');
const path = require('path');

const origSymlinkSync = fs.symlinkSync;

function resolveTarget(target, destPath) {
  if (path.isAbsolute(target)) return target;
  return path.resolve(path.dirname(destPath), target);
}

function safeSymlinkSync(target, destPath, type) {
  const absTarget = resolveTarget(target, destPath);
  try {
    if (fs.existsSync(absTarget)) {
      const stat = fs.statSync(absTarget);
      if (stat.isDirectory()) {
        if (fs.existsSync(destPath)) {
          fs.rmSync(destPath, { recursive: true, force: true });
        }
        fs.cpSync(absTarget, destPath, { recursive: true });
        return;
      } else {
        if (fs.existsSync(destPath)) {
          fs.rmSync(destPath, { force: true });
        }
        fs.copyFileSync(absTarget, destPath);
        return;
      }
    }
  } catch (err) {
    // fallback
  }

  try {
    return origSymlinkSync.call(fs, target, destPath, type);
  } catch (e) {
    // suppress EPERM
  }
}

fs.symlinkSync = safeSymlinkSync;

fs.symlink = function (target, destPath, type, callback) {
  if (typeof type === 'function') {
    callback = type;
    type = null;
  }
  try {
    safeSymlinkSync(target, destPath, type);
    if (callback) callback(null);
  } catch (err) {
    if (callback) callback(null);
  }
};

if (fs.promises) {
  fs.promises.symlink = async function (target, destPath, type) {
    safeSymlinkSync(target, destPath, type);
  };
}
