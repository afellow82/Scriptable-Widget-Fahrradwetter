//Widget Fahrradwetter
//Version 1.53 - 25.09.2022
//Jens Hamann (j_hamann@gmx.net)

//todo: Umstellung "Regenmengen extrahieren" auf Funktion, Eingabeparameter: Zeitraum (z. B. array[1]) und Zielfeld Regenmenge (z. B. array[3])

const wetterdatenarray = [];
let benutzer = 'Eva';
let ort = 'Stuttgart-Vaihingen <> Sindelfingen';
let verkehrsmittelrot = SFSymbol.named('car');

//Standardwerte für Zeiträume
wetterdatenarray[1] = '06 - 07 Uhr'
wetterdatenarray[11] = '07 - 08 Uhr'
wetterdatenarray[21] = '14 - 15 Uhr'
wetterdatenarray[31] = '15 - 16 Uhr'

// Parameter "Jens" für andere Zeiträume
let param = args.widgetParameter;
if (param == 'Jens') {
    wetterdatenarray[1] = '07 - 08 Uhr'
    wetterdatenarray[11] = '08 - 09 Uhr'
    wetterdatenarray[21] = '16 - 17 Uhr'
    wetterdatenarray[31] = '17 - 18 Uhr'
    benutzer = 'Jens';
    ort = 'Stuttgart-Vaihingen <> Stuttgart-Zentrum'
    verkehrsmittelrot = SFSymbol.named('tram');
}

// Definition Grenzwerte für Ampelsystem
const gwrwg=50;
const gwrwr=90;
const gwrmg=0.1;
const gwrmr=0.5;
const gwtempg=6;
const gwtempr=3;

// Definion Schriftgröße in Tabelle
const gr=12;

// Definition Tagindikatorsymbol
let tagindikatorsymbol = SFSymbol.named('calendar');
 
//Definition Farbschema für Symbole und Text
let lightcolor = Color.black();
let darkcolor = Color.white();
let dyncolor = Color.dynamic(lightcolor, darkcolor);

// HTML-Quelltext der Anzeigenseite abrufen
let url = 'https://www.wetter.com/deutschland/stuttgart/vaihingen/DE0010287103.html';
let req = new Request(url);
let html = await req.loadString();

// Widget initialisieren
let widget = new ListWidget();
widget.setPadding(10, 5, 10, 5);
widget.url = 'https://www.wetter.com/deutschland/stuttgart/vaihingen/DE0010287103.html';

// Wetterdaten auswerten
extrahierewetterdaten(html,wetterdatenarray);
let antwort = auswertungdaten(wetterdatenarray);

// Stack "main" zur Trennung Ort, Datum und Rest
let mainstack = widget.addStack();
mainstack.layoutVertically();
//Test linksstack.backgroundColor=new Color('999999');

// Stack "kopfzeile" für Symbol, Ort und Datum
let kopfzeilestack = mainstack.addStack();
kopfzeilestack.layoutHorizontally();
//Test kopfzeilestack.backgroundColor=new Color('dddddd');

kopfzeilestack.addSpacer(10);

// Symbol Ortsindikator einfügen
let ortsymbol = SFSymbol.named('mappin.and.ellipse');
let ortsymbolbild = kopfzeilestack.addImage(ortsymbol.image);
ortsymbolbild.imageSize = new Size(27, 27);
ortsymbolbild.tintColor = dyncolor;

kopfzeilestack.addSpacer(5);

// Stack "ort" für Ort und Datum übereinander
let ortstack = kopfzeilestack.addStack();
ortstack.layoutVertically();
//Test ortstack.backgroundColor=new Color('777777');

// Ort einfügen
let orttext = ortstack.addText(ort);
orttext.font = Font.boldSystemFont(12);

// Stack "datum" für Datum und Folgetagindikator nebeneinander
let datumstack = ortstack.addStack();
datumstack.layoutHorizontally();

// Datum und Uhrzeit einfügen
let heute = new Date();
let stundenaktuell = heute.getHours();
let minutenaktuell = heute.getMinutes();
let heutetextformat = new DateFormatter();
heutetextformat.dateFormat= 'dd.MM.yyyy';
let heutetext2 = heutetextformat.string(heute)+ ' ('+stundenaktuell+':'+minutenaktuell+')';
if (stundenaktuell < 10) {heutetext2 = heutetextformat.string(heute)+ ' (0'+stundenaktuell+':'+minutenaktuell+')';}
let heutetext3 = datumstack.addText(heutetext2);
heutetext3.font = Font.regularSystemFont(12);

// Folgetagindikator neben Datum einfügen
let dfttest = pruefedatumfolgetag();
//Test widget.addText(dfttest.toString())
if (dfttest == true) {
    datumstack.addSpacer(4);
    let tagindikatorsymbolbild4 = datumstack.addImage(tagindikatorsymbol.image);
    tagindikatorsymbolbild4.imageSize = new Size(15, 15);
    tagindikatorsymbolbild4.tintColor = Color.blue();
}

kopfzeilestack.addSpacer();

mainstack.addSpacer();

/*Test*/

// Stack "tabelle" für Textspalten nebeneinander
let tabellestack = mainstack.addStack();
tabellestack.layoutHorizontally();
//Test tabellestack.backgroundColor=new Color('888888');

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
let textzeile1a = textzeile1astack.addText(wetterdatenarray[1]);
textzeile1a.font=Font.semiboldSystemFont(gr);
spalte1stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile2astack = spalte1stack.addStack();
textzeile2astack.layoutHorizontally();
textzeile2astack.addSpacer();
let textzeile2a = textzeile2astack.addText(wetterdatenarray[11]);
textzeile2a.font=Font.semiboldSystemFont(gr);
spalte1stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile3astack = spalte1stack.addStack();
textzeile3astack.layoutHorizontally();
textzeile3astack.addSpacer();
let textzeile3a = textzeile3astack.addText(wetterdatenarray[21]);
textzeile3a.font=Font.semiboldSystemFont(gr);
spalte1stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile4astack = spalte1stack.addStack();
textzeile4astack.layoutHorizontally();
textzeile4astack.addSpacer();
let textzeile4a = textzeile4astack.addText(wetterdatenarray[31]);
textzeile4a.font=Font.semiboldSystemFont(gr);

//Stack "spalte2" für Folgetagindikator
let spalte2stack = tabellestack.addStack();
spalte2stack.layoutVertically();
//Test spalte2stack.backgroundColor=new Color('dddddd');

//Prüfung auf Folgetag Zeitraum 3
let z3test = pruefezeilefolgetag(wetterdatenarray[21], html);
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
let z2test = pruefezeilefolgetag(wetterdatenarray[11], html);
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
let z1test = pruefezeilefolgetag(wetterdatenarray[1], html);
//Test widget.addText(z1test.toString());
if (z1test == true) {
    spalte2stack.size=new Size(15, 28);
    let tagindikatorsymbolbild1 = spalte2stack.addImage(tagindikatorsymbol.image);
    tagindikatorsymbolbild1.imageSize = new Size(15, 15);
    tagindikatorsymbolbild1.tintColor = Color.blue();
}
}
}

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
let textzeile1c = textzeile1cstack.addText(wetterdatenarray[2]+'%');
textzeile1c.font=Font.regularSystemFont(gr);
if (wetterdatenarray[2] >= gwrwg) {textzeile1c.textColor=Color.yellow()}
if (wetterdatenarray[2] >= gwrwr) {textzeile1c.textColor=Color.red()}
spalte3stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile2cstack = spalte3stack.addStack();
textzeile2cstack.layoutHorizontally();
textzeile2cstack.addSpacer();
let textzeile2c = textzeile2cstack.addText(wetterdatenarray[12]+'%');
textzeile2c.font=Font.regularSystemFont(gr);
if (wetterdatenarray[12] >= gwrwg) {textzeile2c.textColor=Color.yellow()}
if (wetterdatenarray[12] >= gwrwr) {textzeile2c.textColor=Color.red()}
spalte3stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile3cstack = spalte3stack.addStack();
textzeile3cstack.layoutHorizontally();
textzeile3cstack.addSpacer();
let textzeile3c = textzeile3cstack.addText(wetterdatenarray[22]+'%');
textzeile3c.font=Font.regularSystemFont(gr);
if (wetterdatenarray[22] >= gwrwg) {textzeile3c.textColor=Color.yellow()}
if (wetterdatenarray[22] >= gwrwr) {textzeile3c.textColor=Color.red()}
spalte3stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile4cstack = spalte3stack.addStack();
textzeile4cstack.layoutHorizontally();
textzeile4cstack.addSpacer();
let textzeile4c = textzeile4cstack.addText(wetterdatenarray[32]+'%');
textzeile4c.font=Font.regularSystemFont(gr);
if (wetterdatenarray[32] >= gwrwg) {textzeile4c.textColor=Color.yellow()}
if (wetterdatenarray[32] >= gwrwr) {textzeile4c.textColor=Color.red()}

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
let textzeile1d = textzeile1dstack.addText(wetterdatenarray[3].toString().replace('.',',')+'l/m²');
textzeile1d.font=Font.regularSystemFont(gr);
if (wetterdatenarray[3] >= gwrmg) {textzeile1d.textColor=Color.yellow()}
if (wetterdatenarray[3] >= gwrmr) {textzeile1d.textColor=Color.red()}
spalte4stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile2dstack = spalte4stack.addStack();
textzeile2dstack.layoutHorizontally();
textzeile2dstack.addSpacer();
let textzeile2d = textzeile2dstack.addText(wetterdatenarray[13].toString().replace('.',',')+'l/m²');
textzeile2d.font=Font.regularSystemFont(gr);
if (wetterdatenarray[13] >= gwrmg) {textzeile2d.textColor=Color.yellow()}
if (wetterdatenarray[13] >= gwrmr) {textzeile2d.textColor=Color.red()}
spalte4stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile3dstack = spalte4stack.addStack();
textzeile3dstack.layoutHorizontally();
textzeile3dstack.addSpacer();
let textzeile3d = textzeile3dstack.addText(wetterdatenarray[23].toString().replace('.',',')+'l/m²');
textzeile3d.font=Font.regularSystemFont(gr);
if (wetterdatenarray[23] >= gwrmg) {textzeile3d.textColor=Color.yellow()}
if (wetterdatenarray[23] >= gwrmr) {textzeile3d.textColor=Color.red()}
spalte4stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile4dstack = spalte4stack.addStack();
textzeile4dstack.layoutHorizontally();
textzeile4dstack.addSpacer();
let textzeile4d = textzeile4dstack.addText(wetterdatenarray[33].toString().replace('.',',')+'l/m²');
textzeile4d.font=Font.regularSystemFont(gr);
if (wetterdatenarray[33] >= gwrmg) {textzeile4d.textColor=Color.yellow()}
if (wetterdatenarray[33] >= gwrmr) {textzeile4d.textColor=Color.red()}

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
let textzeile1e = textzeile1estack.addText(wetterdatenarray[4].toString()+'°C');
textzeile1e.font=Font.regularSystemFont(gr);
if (wetterdatenarray[4] <= gwtempg) {textzeile1e.textColor=Color.yellow()}
if (wetterdatenarray[4] <= gwtempr) {textzeile1e.textColor=Color.red()}
spalte5stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile2estack = spalte5stack.addStack();
textzeile2estack.layoutHorizontally();
textzeile2estack.addSpacer();
let textzeile2e = textzeile2estack.addText(wetterdatenarray[14].toString()+'°C');
textzeile2e.font=Font.regularSystemFont(gr);
if (wetterdatenarray[14] <= gwtempg) {textzeile2e.textColor=Color.yellow()}
if (wetterdatenarray[14] <= gwtempr) {textzeile2e.textColor=Color.red()}
spalte5stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile3estack = spalte5stack.addStack();
textzeile3estack.layoutHorizontally();
textzeile3estack.addSpacer();
let textzeile3e = textzeile3estack.addText(wetterdatenarray[24].toString()+'°C');
textzeile3e.font=Font.regularSystemFont(gr);
if (wetterdatenarray[24] <= gwtempg) {textzeile3e.textColor=Color.yellow()}
if (wetterdatenarray[24] <= gwtempr) {textzeile3e.textColor=Color.red()}
spalte5stack.addSpacer();
// Hilfsstack für Text rechtsbündig
let textzeile4estack = spalte5stack.addStack();
textzeile4estack.layoutHorizontally();
textzeile4estack.addSpacer();
let textzeile4e = textzeile4estack.addText(wetterdatenarray[34].toString()+'°C');
textzeile4e.font=Font.regularSystemFont(gr);
if (wetterdatenarray[34] <= gwtempg) {textzeile4e.textColor=Color.yellow()}
if (wetterdatenarray[34] <= gwtempr) {textzeile4e.textColor=Color.red()}

/*Test*/

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
mainstack.addSpacer();

// Widget starten
widget.presentMedium();

function extrahierewetterdaten(html,array) {
    // Regenwahrscheinlichkeiten extrahieren
    let w2start = html.indexOf(array[1]);
    let w2astart = html.indexOf('swg-col-wv1 swg-row', w2start);
    let w2ende = html.indexOf('&#8239;', w2astart);
    array[2] = Number(html.substring(w2astart+21, w2ende).trim());
  
    let w12start = html.indexOf(array[11]);
    let w12astart = html.indexOf('swg-col-wv1 swg-row', w12start);
    let w12ende = html.indexOf('&#8239;', w12astart);
    array[12] = Number(html.substring(w12astart+21, w12ende).trim());
    
    let w22start = html.indexOf(array[21]);
    let w22astart = html.indexOf('swg-col-wv1 swg-row', w22start);
    let w22ende = html.indexOf('&#8239;', w22astart);
    array[22] = Number(html.substring(w22astart+21, w22ende).trim());
    
    let w32start = html.indexOf(array[31]);
    let w32astart = html.indexOf('swg-col-wv1 swg-row', w32start);
    let w32ende = html.indexOf('&#8239;', w32astart);
    array[32] = Number(html.substring(w32astart+21, w32ende).trim());

    // Regenmengen extrahieren
    let w3start = html.indexOf(array[1]);
    let w3astart = html.indexOf('swg-col-wv2 swg-row', w3start);
    let w3teststring = html.substring(w3astart+21, w3astart+61).trim();
    let w3test = w3teststring.includes('&#8239;')
    let w3test2 = w3teststring.includes('&lt;')
    //Test widget.addText(w3teststring)
    //Test widget.addText(w3test.toString());
    //Test widget.addText(w3test2.toString());
    if (w3test2 == true) {
        let w3bstart = html.indexOf('&lt;', w3astart);
        let w3ende = html.indexOf('&#8239;', w3astart);
        let w3string = html.substring(w3bstart+4, w3ende).trim();
        array[3] = Number(w3string.replace(",", "."));
        //Test widget.addText(w3string);
    } else {
        if (w3test == true) {
        let w3ende = html.indexOf('&#8239;', w3astart);
        let w3string = html.substring(w3astart+21, w3ende).trim();
        array[3] = Number(w3string.replace(",", "."));
        } else {
            array[3] = 0;           
        }
    }  

    let w13start = html.indexOf(array[11]);
    let w13astart = html.indexOf('swg-col-wv2 swg-row', w13start);
    let w13teststring = html.substring(w13astart+21, w13astart+61).trim();
    let w13test = w13teststring.includes('&#8239;')
    let w13test2 = w13teststring.includes('&lt;')
    //Test widget.addText(w13teststring)
    //Test widget.addText(w13test.toString());
    //Test widget.addText(w13test2.toString());
    if (w13test2 == true) {
        let w13bstart = html.indexOf('&lt;', w13astart);
        let w13ende = html.indexOf('&#8239;', w13astart);
        let w13string = html.substring(w13bstart+4, w13ende).trim();
        array[13] = Number(w13string.replace(",", "."));
        //Test widget.addText(w13string);
    } else {
        if (w13test == true) {
        let w13ende = html.indexOf('&#8239;', w13astart);
        let w13string = html.substring(w13astart+21, w13ende).trim();
        array[13] = Number(w13string.replace(",", "."));
        } else {
            array[13] = 0;           
        }
    }  
        
    let w23start = html.indexOf(array[21]);
    let w23astart = html.indexOf('swg-col-wv2 swg-row', w23start);
    let w23teststring = html.substring(w23astart+21, w23astart+61).trim();
    let w23test = w23teststring.includes('&#8239;')
    let w23test2 = w23teststring.includes('&lt;')
    //Test widget.addText(w23teststring)
    //Test widget.addText(w23test.toString());
    //Test widget.addText(w23test2.toString());
    if (w23test2 == true) {
        let w23bstart = html.indexOf('&lt;', w23astart);
        let w23ende = html.indexOf('&#8239;', w23astart);
        let w23string = html.substring(w23bstart+4, w23ende).trim();
        array[23] = Number(w23string.replace(",", "."));
        //Test widget.addText(w23string);
    } else {
        if (w23test == true) {
        let w23ende = html.indexOf('&#8239;', w23astart);
        let w23string = html.substring(w23astart+21, w23ende).trim();
        array[23] = Number(w23string.replace(",", "."));
        } else {
            array[23] = 0;           
        }
    }  
    
    let w33start = html.indexOf(array[31]);
    let w33astart = html.indexOf('swg-col-wv2 swg-row', w33start);
    let w33teststring = html.substring(w33astart+21, w33astart+61).trim();
    let w33test = w33teststring.includes('&#8239;')
    let w33test2 = w33teststring.includes('&lt;')
    //Test widget.addText(w33teststring)
    //Test widget.addText(w33test.toString());
    //Test widget.addText(w33test2.toString());
    if (w33test2 == true) {
        let w33bstart = html.indexOf('&lt;', w33astart);
        let w33ende = html.indexOf('&#8239;', w33astart);
        let w33string = html.substring(w33bstart+4, w33ende).trim();
        array[33] = Number(w33string.replace(",", "."));
        //Test widget.addText(w33string);
    } else {
        if (w33test == true) {
        let w33ende = html.indexOf('&#8239;', w33astart);
        let w33string = html.substring(w33astart+21, w33ende).trim();
        array[33] = Number(w33string.replace(",", "."));
        } else {
            array[33] = 0;           
        }
    }    
//widget.addText(array[33].toString());

    // Temperatur extrahieren
    let w4start = html.indexOf(array[1]);
    let w4astart = html.indexOf('swg-col-temperature swg-row span-3', w4start);
    let w4bstart = html.indexOf('swg-text-large', w4astart);
    let w4ende = html.indexOf('°', w4bstart);
    array[4] = html.substring(w4bstart+16, w4ende).trim(); 
    
    let w14start = html.indexOf(array[11]);
    let w14astart = html.indexOf('swg-col-temperature swg-row span-3', w14start);
    let w14bstart = html.indexOf('swg-text-large', w14astart);
    let w14ende = html.indexOf('°', w14bstart);
    array[14] = html.substring(w14bstart+16, w14ende).trim(); 
    
    let w24start = html.indexOf(array[21]);
    let w24astart = html.indexOf('swg-col-temperature swg-row span-3', w24start);
    let w24bstart = html.indexOf('swg-text-large', w24astart);
    let w24ende = html.indexOf('°', w24bstart);
    array[24] = html.substring(w24bstart+16, w24ende).trim();
    
    let w34start = html.indexOf(array[31]);
    let w34astart = html.indexOf('swg-col-temperature swg-row span-3', w34start);
    let w34bstart = html.indexOf('swg-text-large', w34astart);
    let w34ende = html.indexOf('°', w34bstart);
    array[34] = html.substring(w34bstart+16, w34ende).trim(); 
    
    //Test wetterdatenarray[2]=100;
    //Test wetterdatenarray[3]='10.8';
    //Test wetterdatenarray[4]=-20;               
    //Test widget.addText(array[34]);  
    
    return array
  }

function auswertungdaten(array) {
   let ergebnisauswerungdaten ='gruen'

   if (wetterdatenarray[2] >= gwrwr) {ergebnisauswerungdaten ='rot'}
   if (wetterdatenarray[12] >= gwrwr) {ergebnisauswerungdaten ='rot'}
   if (wetterdatenarray[22] >= gwrwr) {ergebnisauswerungdaten ='rot'}
   if (wetterdatenarray[32] >= gwrwr) {ergebnisauswerungdaten ='rot'}

   if (wetterdatenarray[3] >= gwrmr) {ergebnisauswerungdaten ='rot'}
   if (wetterdatenarray[13] >= gwrmr) {ergebnisauswerungdaten ='rot'}
   if (wetterdatenarray[23] >= gwrmr) {ergebnisauswerungdaten ='rot'}
   if (wetterdatenarray[33] >= gwrmr) {ergebnisauswerungdaten ='rot'}

   if (wetterdatenarray[4] <= gwtempr) {ergebnisauswerungdaten ='rot'}
   if (wetterdatenarray[14] <= gwtempr) {ergebnisauswerungdaten ='rot'}
   if (wetterdatenarray[24] <= gwtempr) {ergebnisauswerungdaten ='rot'}
   if (wetterdatenarray[34] <= gwtempr) {ergebnisauswerungdaten ='rot'}
    
   if (ergebnisauswerungdaten !='rot') {
   if (wetterdatenarray[2] >= gwrwg) {ergebnisauswerungdaten ='gelb'}
   if (wetterdatenarray[12] >= gwrwg) {ergebnisauswerungdaten ='gelb'}
   if (wetterdatenarray[22] >= gwrwg) {ergebnisauswerungdaten ='gelb'}
   if (wetterdatenarray[32] >= gwrwg) {ergebnisauswerungdaten ='gelb'}

   if (wetterdatenarray[3] >= gwrmg) {ergebnisauswerungdaten ='gelb'}
   if (wetterdatenarray[13] >= gwrmg) {ergebnisauswerungdaten ='gelb'}
   if (wetterdatenarray[23] >= gwrmg) {ergebnisauswerungdaten ='gelb'}
   if (wetterdatenarray[33] >= gwrmg) {ergebnisauswerungdaten ='gelb'}

   if (wetterdatenarray[4] <= gwtempg) {ergebnisauswerungdaten ='gelb'}
   if (wetterdatenarray[14] <= gwtempg) {ergebnisauswerungdaten ='gelb'}
   if (wetterdatenarray[24] <= gwtempg) {ergebnisauswerungdaten ='gelb'}
   if (wetterdatenarray[34] <= gwtempg) {ergebnisauswerungdaten ='gelb'}
   //Test ergebnisauswerungdaten='rot';
}
   return ergebnisauswerungdaten;
}

function pruefezeilefolgetag(zeitraum, html) {
    let zft = false;
    let zftstart = html.indexOf(zeitraum);
    let zfttest = html.indexOf(wetterdatenarray[31], zftstart)
    //Test widget.addText(wetterdatenarray[31].toString());
    if (zfttest == -1) {zft = true};
    //Test zft=true;
    return zft
}

function pruefedatumfolgetag() {
    let dft = false;
    let stundeaktuell = new Date().getHours();
    let stundeletzterzeitraumende = wetterdatenarray[31].indexOf(' ', 5)
    let stundeletzterzeitraum = Number(wetterdatenarray[31].substring(5, stundeletzterzeitraumende));

    if (stundeaktuell >= stundeletzterzeitraum) {dft = true;}
    //Test dft = true;
    //Test widget.addText(stundeletzterzeitraumende.toString());
    //Test widget.addText(stundeaktuell.toString());
    //widget.addText(stundeletzterzeitraum.toString());
    return dft
}
