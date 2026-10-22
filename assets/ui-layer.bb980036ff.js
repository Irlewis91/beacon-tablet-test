// Dialogs and sheets live in #layer, outside <main>, so a re-render never loses them by accident.
import { clear } from './ui-dom.43bde315e2.js';

export function openLayer(node) {
  const layer = document.getElementById('layer');
  clear(layer);
  layer.append(node);
  if (node.tagName === 'DIALOG' && typeof node.showModal === 'function') node.showModal();
  return node;
}

export function closeLayer() {
  const layer = document.getElementById('layer');
  for (const d of layer.querySelectorAll('dialog')) if (d.open) d.close();
  clear(layer);
}
