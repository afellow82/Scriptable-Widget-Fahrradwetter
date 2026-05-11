//Widget Fahrradwetter
//Jens Hamann (j_hamann@gmx.net)
// Optimierungen durch ChatGPT

//Version
const version = "2.00𝜺";
// 11.09.2025

// ToDo / Bugs / Ideen: 
// - V: Funktion regenmengeermitteln kann man vereinfachen


const debugLevel = 0;
// 0 - Kein Debugging
// 1 - Werte loggen
// 2 - Zusätzlich Stacks einfärben


let param = args?.widgetParameter;
let benutzer;
let ort;
let verkehrsmittelrot;
const hoeheTabelle = 100;
const breiteAntwortstack = 90;
const hoeheAntwortsymbol = 75;
const hoeheAntwortstack = 110; // Position Version unten rechts


// TESTMODUS für Parameter
//param = "Eva";


// Objekte erzeugen
// 4 Zeitslots -> 4 Objekte
// Zusammensetzung:
// - Zeitslot [String] 
// - Regenwahrscheinlichkeit [Integer]
// - Regenmenge [Fließkommazahl]
// - Temperatur [Integer]
const wetterdaten = Array.from({ length: 4 }, () => ({
  zeitslot: '',
  regenwahrscheinlichkeit: 0,
  regenmenge: 0,
  temperatur: 0
}));


// Variablen und Zeitslots je nach Parameter setzen
benutzer = '<keiner>';
ort = '<keiner>';
verkehrsmittelrot = SFSymbol.named('questionmark');
wetterdaten[0].zeitslot = '00 - 01 Uhr'
wetterdaten[1].zeitslot = '01 - 02 Uhr'
wetterdaten[2].zeitslot = '02 - 03 Uhr'
wetterdaten[3].zeitslot = '03 - 04 Uhr'
   
if (param === 'Eva') {
  benutzer = 'Eva';
  ort = 'Stuttgart-Vaihingen <> Sindelfingen';
  verkehrsmittelrot = SFSymbol.named('car');
  wetterdaten[0].zeitslot = '06 - 07 Uhr'
  wetterdaten[1].zeitslot = '07 - 08 Uhr'
  wetterdaten[2].zeitslot = '14 - 15 Uhr'
  wetterdaten[3].zeitslot = '15 - 16 Uhr'
} else if (param === 'Jens') {
  benutzer = 'Jens';
  ort = 'Zuhause <> Allianz';
  verkehrsmittelrot = SFSymbol.named('bus');
  wetterdaten[0].zeitslot = '06 - 07 Uhr'
  wetterdaten[1].zeitslot = '07 - 08 Uhr'
  wetterdaten[2].zeitslot = '16 - 17 Uhr'
  wetterdaten[3].zeitslot = '17 - 18 Uhr'  
} else if (param === 'Tom') {
  benutzer = 'Tom';
  ort = 'Zuhause <> Hegel-Gymnasium';
  verkehrsmittelrot = SFSymbol.named('figure.walk');
  wetterdaten[0].zeitslot = '07 - 08 Uhr'
  wetterdaten[1].zeitslot = '12 - 13 Uhr'
  wetterdaten[2].zeitslot = '13 - 14 Uhr'
  wetterdaten[3].zeitslot = '14 - 15 Uhr'  
};

// Definition Grenzwerte für Ampelsystem
const grenzwertRegenwahrscheinlichkeitGelb = 50;
const grenzwertRegenwahrscheinlichkeitRot = 90;
const grenzwertRegenmengeGelb = 0.1;
const grenzwertRegenmengeRot = 0.5;
const grenzwertTemperaturGelb = 6;
const grenzwertTemperaturRot=3;

// Definion Schriftgröße in Tabelle
const tabellenschrift = 12;

// Definition Tagindikatorsymbol
const tagindikatorsymbol = SFSymbol.named('calendar');
const folgetagindikator = "📅";
 
//Definition Farbschema für Symbole und Text
const lightcolor = Color.black();
const darkcolor = Color.white();
const dyncolor = Color.dynamic(lightcolor, darkcolor);

// Farben Hintergrund definieren
const hghelloben = new Color('#D8F6CE');
const hghellunten = new Color('#CEECF5');
const hgdunkel = Color.black();
const hgfarbeoben = Color.dynamic(hghelloben, hgdunkel);
const hgfarbeunten = Color.dynamic(hghellunten, hgdunkel);
const g = new LinearGradient();
g.locations = [0,1];
g.colors = [  
  hgfarbeoben,
  hgfarbeunten
];


// HTML-Quelltext der Anzeigenseite abrufen
const url = 'https://www.wetter.com/deutschland/stuttgart/vaihingen/DE0010287103.html';
const req = new Request(url);
const html = await req.loadString();


// Widget initialisieren
let widget = new ListWidget();
widget.setPadding(10, 5, 10, 5);
widget.url = 'https://www.wetter.com/deutschland/stuttgart/vaihingen/DE0010287103.html';
widget.backgroundGradient = g;


// Wetterdaten auswerten
extrahierewetterdaten(html,wetterdaten);
const antwort = auswertungdaten(wetterdaten);


// Debug-Ausgaben im Log
debugLog(1, "Benutzer: " + benutzer);
debugLog(1, "Ort: " + ort);
for (const eintrag of wetterdaten) {
  debugLog(1, `${eintrag.zeitslot} | ${eintrag.regenwahrscheinlichkeit}% | ${eintrag.regenmenge}l/m² | ${eintrag.temperatur}°C`);
}
logDivider(1);
debugLog(1, "Antwort: " + antwort);


// Antwortsymbol je nach Antwort bestimmen
let antwortsymbol = SFSymbol.named('clear');
let topSymbol = SFSymbol.named('clear');
let antwortfarbe = dyncolor;

switch (antwort) {
  case 'gruen':
    antwortsymbol = SFSymbol.named('bicycle');
    topSymbol = SFSymbol.named('cloud.sun');
    antwortfarbe = Color.green();  
    break;

  case 'gelb':
    antwortsymbol = SFSymbol.named('bicycle');
    topSymbol = SFSymbol.named('cloud.sun.rain');
    antwortfarbe = Color.yellow();
    break;

  case 'rot':
    antwortsymbol = verkehrsmittelrot;
    topSymbol = SFSymbol.named('cloud.rain');
    antwortfarbe = Color.red();
    break;
}


// Ausgabe
// Stack "main" zur Erzeugung von Zeilen im Widget
const mainstack = widget.addStack();
mainstack.layoutVertically();

// Stack "kopfzeile" für Symbol, Ort und Datum
const kopfzeilestack = mainstack.addStack();
kopfzeilestack.layoutHorizontally();
colorStack(kopfzeilestack, '#72A14E');

// Symbol oben links einfügen
const symbolbild = kopfzeilestack.addImage(topSymbol.image);
symbolbild.imageSize = new Size(27, 27);
symbolbild.tintColor = dyncolor;

kopfzeilestack.addSpacer(5);

// Stack "ort" für Ort und Datum übereinander
const ortstack = kopfzeilestack.addStack();
ortstack.layoutVertically();
colorStack(ortstack, '#777777');

// Ort einfügen
const orttext = ortstack.addText(ort);
orttext.font = Font.boldSystemFont(12);

// Stack "datum" für Datum und Folgetagindikator nebeneinander
let datumStack = ortstack.addStack();
datumStack.layoutHorizontally();

// Datum und Uhrzeit einfügen
const jetzt = new Date()
  .toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
  .replace(",","");
const standtext = datumStack.addText("Stand: " + jetzt + ' Uhr');
standtext.font = Font.regularSystemFont(12);

mainstack.addSpacer();

// Ausgabe Tabelle (Textspalten nebeneinander)
let tabellestack = mainstack.addStack();
tabellestack.layoutHorizontally();
colorStack(tabellestack, '#AA3619');

// Ausgabe Spalte Folgetagindikatoren
let indikatorStack = tabellestack.addStack();
indikatorStack.layoutVertically();
indikatorStack.size=new Size(18, hoeheTabelle);
colorStack(indikatorStack, '#007288');

for (let i = 0; i < wetterdaten.length; i++) {
  if (pruefezeitslotfolgetag(wetterdaten[i].zeitslot, html)) {
    indikatorStack.addSpacer();
    const indikator = indikatorStack.addText(folgetagindikator);
    indikator.font=Font.regularSystemFont(tabellenschrift);
  } else {
    indikatorStack.addSpacer();
    const leerzeichen = indikatorStack.addText(" ");
    leerzeichen.font = Font.regularSystemFont(tabellenschrift);
  }
}

// Ausgabe Spalte Zeitslots
let zeitslotStack = tabellestack.addStack();
zeitslotStack.layoutVertically();
zeitslotStack.size=new Size(80, hoeheTabelle);

for (let i = 0; i < wetterdaten.length; i++) {
  zeitslotausgeben (zeitslotStack, wetterdaten[i].zeitslot);
}

// Ausgabe Spalte Regenwahrscheinlichkeiten
let regenwahrscheinlichkeitStack = tabellestack.addStack();
regenwahrscheinlichkeitStack.layoutVertically();
regenwahrscheinlichkeitStack.size=new Size(40, hoeheTabelle);

for (let i = 0; i < wetterdaten.length; i++) {
  regenwahrscheinlichkeitausgeben (regenwahrscheinlichkeitStack, wetterdaten[i].regenwahrscheinlichkeit);
}

// Ausgabe Spalte Regenmengen
let regenmengeStack = tabellestack.addStack();
regenmengeStack.layoutVertically();
regenmengeStack.size=new Size(55, hoeheTabelle);

for (let i = 0; i < wetterdaten.length; i++) {
  regenmengeausgeben (regenmengeStack, wetterdaten[i].regenmenge);
}

// Ausgabe Spalte Temperaturen
let temperaturStack = tabellestack.addStack();
temperaturStack.layoutVertically();
temperaturStack.size=new Size(45, hoeheTabelle);

for (let i = 0; i < wetterdaten.length; i++) {
  temperaturausgeben (temperaturStack, wetterdaten[i].temperatur);
}

// Ausgabe Antwortsymbol, Benutzer, Version
let antwortstack = tabellestack.addStack();
antwortstack.layoutVertically();
antwortstack.size = new Size(breiteAntwortstack, hoeheAntwortstack);
colorStack(antwortstack, '#12EE92');

antwortstack.addSpacer();

// Ausgabe Antwortsymbol
let symbolStack = antwortstack.addStack();
symbolStack.layoutHorizontally();
symbolStack.size = new Size(breiteAntwortstack, hoeheAntwortsymbol);

symbolStack.addSpacer();

let antwortsymbolbild = symbolStack.addImage(antwortsymbol.image);
antwortsymbolbild.imageSize = new Size(hoeheAntwortsymbol, hoeheAntwortsymbol);
antwortsymbolbild.tintColor = antwortfarbe;

symbolStack.addSpacer();

// Ausgabe Name und ggf. Herz
let namestack = antwortstack.addStack();
namestack.layoutHorizontally();
namestack.size = new Size(breiteAntwortstack, 0);
colorStack(namestack, '#cccccc');

namestack.addSpacer();
let nameText;
if (benutzer === "Eva") {
  nameText = namestack.addText(benutzer + " ❤️");
} else {
  nameText = namestack.addText(benutzer);
}
nameText.font=Font.italicSystemFont(10);
namestack.addSpacer();

antwortstack.addSpacer();

//Version ausgeben
const versionsStack = antwortstack.addStack();
versionsStack.layoutHorizontally();
versionsStack.addSpacer();
colorStack(versionsStack, '#636363');
const versiontext = versionsStack.addText('[V' + version + "]");
versiontext.font = Font.regularSystemFont(7);
versiontext.textColor = Color.darkGray();
versionsStack.addSpacer(10);


// Widget starten
if (!config.runsInWidget) {
  widget.presentMedium();
}

Script.setWidget(widget);
Script.complete();


// Wetterdaten in Objekte schreiben
function extrahierewetterdaten(html, wetterdaten) {

  for (const daten of wetterdaten) {

    // Regenwahrscheinlichkeit
    let start = html.indexOf(daten.zeitslot);

    let regenStart = html.indexOf('swg-col-wv1 swg-row', start);
    let regenEnde = html.indexOf('&#8239;', regenStart);

    daten.regenwahrscheinlichkeit = Number(
      html.substring(regenStart + 21, regenEnde).trim()
    );

    // Regenmenge
    daten.regenmenge = regenmengeermitteln(daten.zeitslot);

    // Temperatur
    let tempStart = html.indexOf(
      'swg-col-temperature swg-row span-3',
      start
    );

    let tempTextStart = html.indexOf(
      'swg-text-large',
      tempStart
    );

    let tempEnde = html.indexOf('°', tempTextStart);

    daten.temperatur = Number(
      html.substring(tempTextStart + 16, tempEnde).trim()
    );
  }

  return wetterdaten;
}


// Funktion Ermittlung der Regenmenge
function regenmengeermitteln(zeitraum) {
    // Regenmenge mit 0 initialisieren
    let regenmenge = 0;
    
    //Regenmenge im Code finden
    let rmstart = html.indexOf(zeitraum);
    let rmastart = html.indexOf('swg-col-wv2 swg-row', rmstart);
    let rmteststring = html.substring(rmastart+21, rmastart+61).trim();
    
    //Sonderfälle identifizieren
    let rmtest = rmteststring.includes('&#8239;')
    let rmtest2 = rmteststring.includes('&lt;')
    
    if (rmtest2 == true) {
        let rmbstart = html.indexOf('&lt;', rmastart);
        let rmende = html.indexOf('&#8239;', rmastart);
        let rmstring = html.substring(rmbstart+4, rmende).trim();
        regenmenge = Number(rmstring.replace(",", "."));
        //Test widget.addText(rmstring);
    } else {
        if (rmtest == true) {
        let rmende = html.indexOf('&#8239;', rmastart);
        let rmstring = html.substring(rmastart+21, rmende).trim();
        regenmenge = Number(rmstring.replace(",", "."));   
        }
    } 
return regenmenge;
}


// Funktion Auswertung der Daten durch Abgleich mit Grenzwerten (Ergebnis "rot", "gelb" oder "gruen")
function auswertungdaten(wetterdaten) {

  // ROT prüfen
  const rot = wetterdaten.some(daten =>
    daten.regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitRot ||
    daten.regenmenge >= grenzwertRegenmengeRot ||
    daten.temperatur <= grenzwertTemperaturRot
  );

  if (rot) return 'rot';

  // GELB prüfen
  const gelb = wetterdaten.some(daten =>
    daten.regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitGelb ||
    daten.regenmenge >= grenzwertRegenmengeGelb ||
    daten.temperatur <= grenzwertTemperaturGelb
  );

  if (gelb) return 'gelb';

  return 'gruen';
}


// Funktion Prüfung, ob Zeile schon zum Folgetag gehört
function pruefezeitslotfolgetag (zeitslot) {
  const endstundeZeitslot = Number(zeitslot.substring(5,7));
  const aktuelleStunde = new Date().getHours();
  logDivider(1);
  debugLog(1, "[pruefezeitslotfolgetag] Stunde aus Zeitslot-String: " + endstundeZeitslot);
  debugLog(1, "[pruefezeitslotfolgetag] Aktuelle Stunde: " + aktuelleStunde);
  debugLog(1, "[pruefezeitslotfolgetag] Rückgabe (aktuelleStunde >= endstundeZeitslot): " + (aktuelleStunde >= endstundeZeitslot));
  return aktuelleStunde >= endstundeZeitslot;
}


// Funktion zum Einfärben von Stacks
function colorStack(stack, color, level = 2) {
    if (debugLevel >= level) {
        stack.backgroundColor = new Color(color);
    }
}


// Funktion Linie im Log zeichnen
function logDivider(level) {
  if (debugLevel >= level) console.log("-------------------");
}


// Funktion Log-Eintrag erstellen
function debugLog(level, text) {
  if (debugLevel >= level) console.log(text);
}


// Funktion Zeitslot in Tabelle ausgeben
function zeitslotausgeben (stack, zeitslot) {
  stack.addSpacer();
  let zeilestack = stack.addStack();
  zeilestack.layoutHorizontally();
  zeilestack.addSpacer();
  let textzeile = zeilestack.addText(zeitslot);
  textzeile.font=Font.semiboldSystemFont(tabellenschrift);
}


// Funktion Regenwahrscheinlichkeit in Tabelle ausgeben
function regenwahrscheinlichkeitausgeben (stack, regenwahrscheinlichkeit) {
  stack.addSpacer();
  const zeilestack = stack.addStack();
  zeilestack.layoutHorizontally();
  zeilestack.addSpacer();
  const textzeile = zeilestack.addText(regenwahrscheinlichkeit + '%');
  textzeile.font=Font.regularSystemFont(tabellenschrift);
  if (regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitRot) {textzeile.textColor=Color.red()}
  else if (regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitGelb) {textzeile.textColor=Color.yellow()}
}


// Funktion Regenmenge in Tabelle ausgeben
function regenmengeausgeben (stack, regenmenge) {
  stack.addSpacer();
  const zeilestack = stack.addStack();
  zeilestack.layoutHorizontally();
  zeilestack.addSpacer();
  const textzeile = zeilestack.addText(regenmenge + 'l/m²');
  textzeile.font=Font.regularSystemFont(tabellenschrift);
  if (regenmenge >= grenzwertRegenmengeRot) {textzeile.textColor=Color.red()}
  else if (regenmenge >= grenzwertRegenmengeGelb) {textzeile.textColor=Color.yellow()}
}


// Funktion Temperatur in Tabelle ausgeben
function temperaturausgeben (stack, temperatur) {
  stack.addSpacer();
  const zeilestack = stack.addStack();
  zeilestack.layoutHorizontally();
  zeilestack.addSpacer();
  const textzeile = zeilestack.addText(temperatur + '°C');
  textzeile.font=Font.regularSystemFont(tabellenschrift);
  if (temperatur <= grenzwertTemperaturRot) {textzeile.textColor=Color.red()}
  else if (temperatur <= grenzwertTemperaturGelb) {textzeile.textColor=Color.yellow()}
}
