// jshint -W119

async function main() {
	let widget = new ListWidget();
  widget.addText('Widget Test Jens');
 	let value = (config.runsInWidget) ? Script.setWidget(widget) : await widget.presentSmall();
 	Script.complete();
}

module.exports = {
  main
};