import { useEditor, useValue } from 'tldraw';
import 'tldraw/tldraw.css';
import { ShapeList } from './ShapeList';
import './layer-panel.css';

export const LAYER_PANEL_WIDTH = 200;

// TODO: only show the contents of the selected frame

export function LayerPanel() {
  const editor = useEditor();
  const isFocusMode = useValue('isFocusMode', () => editor.getInstanceState().isFocusMode, [
    editor,
  ]);
  const shapeIds = useValue(
    'shapeIds',
    () => editor.getSortedChildIdsForParent(editor.getCurrentPageId()),
    [editor],
  );
  const isMobile = useValue('is mobile', () => editor.getViewportScreenBounds().width < 700, [
    editor,
  ]);

  if (isFocusMode || isMobile) {
    return null;
  }

  return (
    <div className='layer-panel'>
      <div className='layer-panel-title'>Elements</div>
      <ShapeList shapeIds={shapeIds} depth={0} />
    </div>
  );
}
