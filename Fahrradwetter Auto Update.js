// jshint -W119

async function main() {
  let widget = new ListWidget();
  widget.addText('Fahrradwetter Auto Update');
  widget.presentSmall();
}

module.exports = {
  main
};
