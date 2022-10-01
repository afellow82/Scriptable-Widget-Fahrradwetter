// jshint -W119

async function main() {
	let widget = new ListWidget();
  widget.addText('Hauptfunktion');
//	aufruf();
 	let value = (config.runsInWidget) ? Script.setWidget(widget) : await widget.presentSmall();
 	Script.complete();
}

function aufruf() {
 widget.addText('Aufruffunktion');	
}

module.exports = {
  main
};
