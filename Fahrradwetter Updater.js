// jshint -W119
// Optimiert durch Chat GPT

let scriptName = 'Fahrradwetter';
let scriptUrl = 'https://raw.githubusercontent.com/afellow82/Scriptable-Widget-Fahrradwetter/main/Fahrradwetter%20Auto%20Update.js';

let modulePath = await downloadModule(scriptName, scriptUrl); // jshint ignore:line
if (modulePath != null) {
  try {
    let importedModule = importModule(modulePath);
    await importedModule.main(); // jshint ignore:line
  } catch (e) {
    console.log('Import failed: ' + e);
  }
} else {
  console.log('Failed to download new module and could not find any local version.');
}

async function downloadModule(scriptName, scriptUrl) {
  let fm = FileManager.local();

  const widgetId = "medium";

  let moduleDir = fm.joinPath(
    fm.documentsDirectory(),
    `${scriptName}-${widgetId}`
  );

  if (!fm.fileExists(moduleDir)) {
    fm.createDirectory(moduleDir);
  }

  // Immer gleicher Dateiname
  let modulePath = fm.joinPath(moduleDir, 'module.js');

  // Cache-Alter prüfen
  let shouldUpdate = true;

  if (fm.fileExists(modulePath)) {
    let modified = fm.modificationDate(modulePath);
    let ageHours = (Date.now() - modified.getTime()) / 1000 / 60 / 60;

    // Nur alle 12 Stunden neu laden
    if (ageHours < 12) {
      shouldUpdate = false;
    }
  }

  // Update nur wenn nötig
  if (shouldUpdate) {
    try {
      console.log('Downloading latest module...');

      let req = new Request(scriptUrl);

      // Timeout erhöhen
      req.timeoutInterval = 60;

      let moduleJs = await req.loadString();

      // Erst temporär schreiben
      let tempPath = fm.joinPath(moduleDir, 'module.tmp');

      fm.writeString(tempPath, moduleJs);

      // Dann atomar ersetzen
      if (fm.fileExists(modulePath)) {
        fm.remove(modulePath);
      }

      fm.move(tempPath, modulePath);

      console.log('Module updated');
    } catch (e) {
      console.log('Update failed: ' + e);
    }
  }

  // Existierende Datei verwenden
  if (fm.fileExists(modulePath)) {
    return modulePath;
  }

  return null;
}

function getModuleVersions(scriptName) {
  // returns all saved module versions and latest version of them
  let fm = FileManager.local();
  let scriptPath = module.filename;
  let moduleDir = scriptPath.replace(fm.fileName(scriptPath, true), scriptName);
  let dirContents = fm.listContents(moduleDir);
  if (dirContents.length > 0) {
    let versions = dirContents.map(x => {
      if (x.endsWith('.js')) return parseInt(x.replace('.js', ''));
    });
    versions.sort(function(a, b) {
      return b - a;
    });
    versions = versions.filter(Boolean);
    if (versions.length > 0) {
      let moduleFiles = versions.map(x => {
        return x + '.js';
      });
      moduleLatestFile = versions[0] + '.js';
      return [moduleFiles, moduleLatestFile];
    }
  }
  return [null, null];
}
