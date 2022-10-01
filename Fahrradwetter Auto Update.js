// jshint -W119

async function main() {
  let widget = new ListWidget();
  widget.addText('Widget Test Jens');
  widget.presentSmall();
}

module.exports = {
  main
};
