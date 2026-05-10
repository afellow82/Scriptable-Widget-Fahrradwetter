//Widget Fahrradwetter
//Jens Hamann (j_hamann@gmx.net)
// Optimierungen durch ChatGPT

//Version
const version = "2.00𝛃";
// 10.09.2025

// ToDo / Bugs / Ideen: 
// - I: Indikator nur noch vor die Uhrzeiten (Indikatorspalte mit fester Breite)
// - I: Herz rot und horizontal zentriert zu Name
// - I: Symbol oben links abhängig von Wetterdaten Regen, gemischt oder Sonne
// - I: Version grau unten rechts
// - I: Uhrzeiten vertikal zentriert
// - T: pruefezeitslotfolgetag fertig schreiben

const debugLevel = 2;
// 0 - Kein Debugging
// 1 - Werte loggen
// 2 - Zusätzlich Stacks einfärben


let param = args?.widgetParameter;
let benutzer;
let ort;
let verkehrsmittelrot;


// TESTMODUS für Parameter
param = "Eva";


// Objekte erzeugen
// 4 Zeitslots -> 4 Objekte
// Zusammensetzung:
// - Zeitslot [String] 
// - Regenwahrscheinlichkeit [Integer]
// - Regenmenge [Fließkommazahl]
// - Temperatur [Integer]
const wetterdaten = [
  {},
  {},
  {},
  {}
];


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


// Ausgabe
// Stack "main" zur Erzeugung von Zeilen im Widget
const mainstack = widget.addStack();
mainstack.layoutVertically();

// Stack "kopfzeile" für Symbol, Ort und Datum
const kopfzeilestack = mainstack.addStack();
kopfzeilestack.layoutHorizontally();
colorStack(kopfzeilestack, '#72A14E');

kopfzeilestack.addSpacer(10);

// Symbol oben links einfügen
const symbolbild = kopfzeilestack.addImage(symbolbestimmen(antwort).image);
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

/**
// Folgetagindikator neben Datum einfügen
let dfttest = pruefedatumfolgetag();
//Test widget.addText(dfttest.toString())
if (dfttest == true) {
    datumstack.addSpacer(4);
    let tagindikatorsymbolbild4 = datumstack.addImage(tagindikatorsymbol.image);
    tagindikatorsymbolbild4.imageSize = new Size(15, 15);
    tagindikatorsymbolbild4.tintColor = Color.blue();
}
**/

//kopfzeilestack.addSpacer();

mainstack.addSpacer();

// Stack "tabelle" für Textspalten nebeneinander
let tabellestack = mainstack.addStack();
tabellestack.layoutHorizontally();
colorStack(tabellestack, '#AA3619');


// BIS HIER IST DAS REFACTORING ERFOLGT


// Stack für Spalte Folgetagindikatoren
let indikatorStack = tabellestack.addStack();
indikatorStack.layoutVertically();
indikatorStack.size=new Size(20, 0);
colorStack(indikatorStack, '#007288');

for (let i = 0; i < wetterdaten.length; i++) {
  
  if (pruefezeitslotfolgetag(wetterdaten[i].zeitslot, html)) {

}
}



 


//Stack "spalte1" für Zeiträume
let spalte1stack = tabellestack.addStack();
spalte1stack.layoutVertically();
spalte1stack.size=new Size(80, 90);
spalte1stack.addSpacer();
//Test spalte1stack.backgroundColor=new Color('aaaaaa');
// Hilfsstack für Text rechtsbündig
let textzeile1astack = spalte1stack.addStack();
textzeile1astack.layoutHorizontally();
textzeile1astack.addSpacer();
let textzeile1a = textzeile1astack.addText(wetterdaten[0].zeitslot);
textzeile1a.font=Font.semiboldSystemFont(tabellenschrift);
spalte1stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile2astack = spalte1stack.addStack();
textzeile2astack.layoutHorizontally();
textzeile2astack.addSpacer();
let textzeile2a = textzeile2astack.addText(wetterdaten[1].zeitslot);
textzeile2a.font=Font.semiboldSystemFont(tabellenschrift);
spalte1stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile3astack = spalte1stack.addStack();
textzeile3astack.layoutHorizontally();
textzeile3astack.addSpacer();
let textzeile3a = textzeile3astack.addText(wetterdaten[2].zeitslot);
textzeile3a.font=Font.semiboldSystemFont(tabellenschrift);
spalte1stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile4astack = spalte1stack.addStack();
textzeile4astack.layoutHorizontally();
textzeile4astack.addSpacer();
let textzeile4a = textzeile4astack.addText(wetterdaten[3].zeitslot);
textzeile4a.font=Font.semiboldSystemFont(tabellenschrift);
/**
//Stack "spalte2" für Folgetagindikator
let spalte2stack = tabellestack.addStack();
spalte2stack.layoutVertically();
//Test spalte2stack.backgroundColor=new Color('dddddd');

//Prüfung auf Folgetag Zeitraum 3
let z3test = pruefezeilefolgetag(wetterdaten[2].zeitslot, html);
//Test widget.addText(z3test.toString());
if (z3test == true) {
    spalte2stack.size=new Size(15, 74);
    let tagindikatorsymbolbild = spalte2stack.addImage(tagindikatorsymbol.image);
    tagindikatorsymbolbild.imageSize = new Size(15, 15);
    tagindikatorsymbolbild.tintColor = Color.blue();
    spalte2stack.addSpacer(8);
    let tagindikatorsymbolbild2 = spalte2stack.addImage(tagindikatorsymbol.image);
    tagindikatorsymbolbild2.imageSize = new Size(15, 15);
    tagindikatorsymbolbild2.tintColor = Color.blue();
    spalte2stack.addSpacer(8);
    let tagindikatorsymbolbild3 = spalte2stack.addImage(tagindikatorsymbol.image);
    tagindikatorsymbolbild3.imageSize = new Size(15, 15);
    tagindikatorsymbolbild3.tintColor = Color.blue();
} else {

//Prüfung auf Folgetag Zeitraum 2
let z2test = pruefezeilefolgetag(wetterdaten[1].zeitslot, html);
//Test widget.addText(z2test.toString());
if (z2test == true) {
    spalte2stack.size=new Size(15, 52);
    let tagindikatorsymbolbild = spalte2stack.addImage(tagindikatorsymbol.image);
    tagindikatorsymbolbild.imageSize = new Size(15, 15);
    tagindikatorsymbolbild.tintColor = Color.blue();
    spalte2stack.addSpacer(8);
    let tagindikatorsymbolbild2 = spalte2stack.addImage(tagindikatorsymbol.image);
    tagindikatorsymbolbild2.imageSize = new Size(15, 15);
    tagindikatorsymbolbild2.tintColor = Color.blue();
} else {


//Prüfung auf Folgetag Zeitraum 1
let z1test = pruefezeilefolgetag(wetterdaten[0].zeitslot, html);
//Test widget.addText(z1test.toString());
if (z1test == true) {
    spalte2stack.size=new Size(15, 28);
    let tagindikatorsymbolbild1 = spalte2stack.addImage(tagindikatorsymbol.image);
    tagindikatorsymbolbild1.imageSize = new Size(15, 15);
    tagindikatorsymbolbild1.tintColor = Color.blue();
}
}
}
**/

//Stack "spalte3" für Regenwahrscheinlichkeiten
let spalte3stack = tabellestack.addStack();
spalte3stack.layoutVertically();
spalte3stack.size=new Size(40, 90);
spalte3stack.addSpacer();
//Test spalte3stack.backgroundColor=new Color('dddddd');
// Hilfsstack für Text rechtsbündig
let textzeile1cstack = spalte3stack.addStack();
textzeile1cstack.layoutHorizontally();
textzeile1cstack.addSpacer();
let textzeile1c = textzeile1cstack.addText(wetterdaten[0].regenwahrscheinlichkeit+'%');
textzeile1c.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[0].regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitGelb) {textzeile1c.textColor=Color.yellow()}
if (wetterdaten[0].regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitRot) {textzeile1c.textColor=Color.red()}
spalte3stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile2cstack = spalte3stack.addStack();
textzeile2cstack.layoutHorizontally();
textzeile2cstack.addSpacer();
let textzeile2c = textzeile2cstack.addText(wetterdaten[1].regenwahrscheinlichkeit+'%');
textzeile2c.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[1].regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitGelb) {textzeile2c.textColor=Color.yellow()}
if (wetterdaten[1].regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitRot) {textzeile2c.textColor=Color.red()}
spalte3stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile3cstack = spalte3stack.addStack();
textzeile3cstack.layoutHorizontally();
textzeile3cstack.addSpacer();
let textzeile3c = textzeile3cstack.addText(wetterdaten[2].regenwahrscheinlichkeit+'%');
textzeile3c.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[2].regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitGelb) {textzeile3c.textColor=Color.yellow()}
if (wetterdaten[2].regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitRot) {textzeile3c.textColor=Color.red()}
spalte3stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile4cstack = spalte3stack.addStack();
textzeile4cstack.layoutHorizontally();
textzeile4cstack.addSpacer();
let textzeile4c = textzeile4cstack.addText(wetterdaten[3].regenwahrscheinlichkeit+'%');
textzeile4c.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[3].regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitGelb) {textzeile4c.textColor=Color.yellow()}
if (wetterdaten[3].regenwahrscheinlichkeit >= grenzwertRegenwahrscheinlichkeitRot) {textzeile4c.textColor=Color.red()}

//Stack "spalte4" für Regenmengen
let spalte4stack = tabellestack.addStack();
spalte4stack.layoutVertically();
spalte4stack.size=new Size(55, 90);
spalte4stack.addSpacer();
//Test spalte4stack.backgroundColor=new Color('aaaaaa');
// Hilfsstack für Text rechtsbündig
let textzeile1dstack = spalte4stack.addStack();
textzeile1dstack.layoutHorizontally();
textzeile1dstack.addSpacer();
let textzeile1d = textzeile1dstack.addText(wetterdaten[0].regenmenge.toString().replace('.',',')+'l/m²');
textzeile1d.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[0].regenmenge >= grenzwertRegenmengeGelb) {textzeile1d.textColor=Color.yellow()}
if (wetterdaten[0].regenmenge >= grenzwertRegenmengeRot) {textzeile1d.textColor=Color.red()}
spalte4stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile2dstack = spalte4stack.addStack();
textzeile2dstack.layoutHorizontally();
textzeile2dstack.addSpacer();
let textzeile2d = textzeile2dstack.addText(wetterdaten[1].regenmenge.toString().replace('.',',')+'l/m²');
textzeile2d.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[1].regenmenge >= grenzwertRegenmengeGelb) {textzeile2d.textColor=Color.yellow()}
if (wetterdaten[1].regenmenge >= grenzwertRegenmengeRot) {textzeile2d.textColor=Color.red()}
spalte4stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile3dstack = spalte4stack.addStack();
textzeile3dstack.layoutHorizontally();
textzeile3dstack.addSpacer();
let textzeile3d = textzeile3dstack.addText(wetterdaten[2].regenmenge.toString().replace('.',',')+'l/m²');
textzeile3d.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[2].regenmenge >= grenzwertRegenmengeGelb) {textzeile3d.textColor=Color.yellow()}
if (wetterdaten[2].regenmenge >= grenzwertRegenmengeRot) {textzeile3d.textColor=Color.red()}
spalte4stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile4dstack = spalte4stack.addStack();
textzeile4dstack.layoutHorizontally();
textzeile4dstack.addSpacer();
let textzeile4d = textzeile4dstack.addText(wetterdaten[3].regenmenge.toString().replace('.',',')+'l/m²');
textzeile4d.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[3].regenmenge >= grenzwertRegenmengeGelb) {textzeile4d.textColor=Color.yellow()}
if (wetterdaten[3].regenmenge >= grenzwertRegenmengeRot) {textzeile4d.textColor=Color.red()}

//Stack "spalte5" für Temperaturen
let spalte5stack = tabellestack.addStack();
spalte5stack.layoutVertically();
spalte5stack.size=new Size(45, 90);
spalte5stack.addSpacer();
//Test spalte5stack.backgroundColor=new Color('bbbbbb');
// Hilfsstack für Text rechtsbündig
let textzeile1estack = spalte5stack.addStack();
textzeile1estack.layoutHorizontally();
textzeile1estack.addSpacer();
let textzeile1e = textzeile1estack.addText(wetterdaten[0].temperatur.toString()+'°C');
textzeile1e.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[0].temperatur <= grenzwertTemperaturGelb) {textzeile1e.textColor=Color.yellow()}
if (wetterdaten[0].temperatur <= grenzwertTemperaturRot) {textzeile1e.textColor=Color.red()}
spalte5stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile2estack = spalte5stack.addStack();
textzeile2estack.layoutHorizontally();
textzeile2estack.addSpacer();
let textzeile2e = textzeile2estack.addText(wetterdaten[1].temperatur.toString()+'°C');
textzeile2e.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[1].temperatur <= grenzwertTemperaturGelb) {textzeile2e.textColor=Color.yellow()}
if (wetterdaten[1].temperatur <= grenzwertTemperaturRot) {textzeile2e.textColor=Color.red()}
spalte5stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile3estack = spalte5stack.addStack();
textzeile3estack.layoutHorizontally();
textzeile3estack.addSpacer();
let textzeile3e = textzeile3estack.addText(wetterdaten[2].temperatur.toString()+'°C');
textzeile3e.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[2].temperatur <= grenzwertTemperaturGelb) {textzeile3e.textColor=Color.yellow()}
if (wetterdaten[2].temperatur <= grenzwertTemperaturRot) {textzeile3e.textColor=Color.red()}
spalte5stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile4estack = spalte5stack.addStack();
textzeile4estack.layoutHorizontally();
textzeile4estack.addSpacer();
let textzeile4e = textzeile4estack.addText(wetterdaten[3].temperatur.toString()+'°C');
textzeile4e.font=Font.regularSystemFont(tabellenschrift);
if (wetterdaten[3].temperatur <= grenzwertTemperaturGelb) {textzeile4e.textColor=Color.yellow()}
if (wetterdaten[3].temperatur <= grenzwertTemperaturRot) {textzeile4e.textColor=Color.red()}

//Stack "antwort" für Antwortsymbol und Benutzer
let antwortstack = tabellestack.addStack();
antwortstack.layoutVertically();
//Test antwortstack.backgroundColor=new Color('999999');

//Antwortsymbol einfügen
let antwortsymbol = SFSymbol.named('clear');
if (antwort=='gruen' || antwort== 'gelb') {antwortsymbol = SFSymbol.named('bicycle');}
if (antwort=='rot') {antwortsymbol = verkehrsmittelrot;}
let antwortsymbolbild = antwortstack.addImage(antwortsymbol.image);
antwortsymbolbild.imageSize = new Size(77, 78);
//Test antwortsymbolbild.borderColor = Color.black();
//Test antwortsymbolbild.borderWidth = 1;
antwortsymbolbild.tintColor = dyncolor;
if (antwort=='gruen') {antwortsymbolbild.tintColor = Color.green();}
if (antwort=='gelb') {antwortsymbolbild.tintColor = Color.yellow();}
if (antwort=='rot') {antwortsymbolbild.tintColor = Color.red();}

// Stack "name" für Name Benutzer und Herz nebeneinander und zentriert
let namestack = antwortstack.addStack();
namestack.layoutHorizontally();
namestack.size = new Size(77,12);
//Test namestack.backgroundColor=new Color('cccccc');

namestack.addSpacer();

// Name Benutzer und ggf. Herz einfügen
let name = namestack.addText(benutzer);
name.font=Font.italicSystemFont(10);
if (benutzer == 'Eva') {
    namestack.addSpacer(3);
    let herzsymbol = SFSymbol.named('heart');
    let herzsymbolbild = namestack.addImage(herzsymbol.image);
    herzsymbolbild.imageSize = new Size(10, 10);
    herzsymbolbild.tintColor = dyncolor;
}

namestack.addSpacer();

let versiontext = antwortstack.addText('     V'+version);
versiontext.font=Font.thinSystemFont(6);
versiontext.textColor = Color.blue();

mainstack.addSpacer();

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
    //Test widget.addText(regenmenge.toString());
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

// FEHLER FUNKTION LIEFERT NICHT GEWÜNSCHTES ERGEBNIS -> MUSS NEU GESCHRIEBEN WERDEN
// Funktion Prüfung, ob Zeile schon zum Folgetag gehört
function pruefezeitslotfolgetag (zeitslot) {
  const endstundeZeitslot = Number(zeitslot.substring(5,7));
  debugLog(1, "[pruefezeitslotfolgetag] Stunde aus Zeitslot-String: " + endstundeZeitslot);
}

/**
function pruefezeilefolgetag(zeitraum, html) {
    let zeilefolgetag = false;
    let zftstart = html.indexOf(zeitraum);
    let zfttest = html.indexOf(wetterdaten[3].zeitslot, zftstart)
    console.log(zftstart);
    console.log(zfttest);
    if (zfttest == -1) {zeilefolgetag = true};
    return zeilefolgetag
}
**/
/**

**/
/**
function pruefedatumfolgetag() {
    let dft = false;
    let stundeaktuell = new Date().getHours();
    let stundeletzterzeitraumende = wetterdaten[3].zeitslot.indexOf(' ', 5);
    let stundeletzterzeitraum = Number(wetterdaten[3].zeitslot.substring(5, stundeletzterzeitraumende));

    if (stundeaktuell >= stundeletzterzeitraum) {datumfolgetag = true;}

    return datumfolgetag
}
**/
/**
function pruefezeilefolgetag(zeitraum, html) {
    let zft = false;
    let zftstart = html.indexOf(zeitraum);
    let zfttest = html.indexOf(wetterdatenarray[31], zftstart)
    if (zfttest == -1) {zft = true};
    return zft
}
**/

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


// Funtion bestimmt je nach Antwort das passende Symbol
function symbolbestimmen(antwort) {
  if (antwort === 'gruen') return SFSymbol.named('cloud.sun');
  else if (antwort === 'gelb') return SFSymbol.named('cloud.sun.rain');
  else if (antwort === 'rot') return SFSymbol.named('cloud.rain');
}
