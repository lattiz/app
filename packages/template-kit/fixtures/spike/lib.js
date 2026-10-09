const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="gjs"></div></body></html>', { pretendToBeVisual: true });
global.window = dom.window; global.document = dom.window.document;
for (const k of ['navigator','Node','Element','HTMLElement','DOMParser','XMLSerializer','MutationObserver','getComputedStyle','CSS','Event','CustomEvent']) { try { global[k] = dom.window[k]; } catch(e){} }
const grapesjs = require('grapesjs');
function headless(data){
  const editor = grapesjs.init({ headless: true, storageManager: false, projectData: data });
  return editor;
}
module.exports = { headless };
