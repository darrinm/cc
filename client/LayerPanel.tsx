import { useEditor, useValue } from 'tldraw';
import 'tldraw/tldraw.css';
import { showLayerPanel } from './App';
import { ShapeList } from './ShapeList';
import { CloseIcon } from './icons';
import './layer-panel.css';

export const LAYER_PANEL_WIDTH = 200;

// TODO: only show the contents of the selected frame

export function LayerPanel() {
  const editor = useEditor();
  const isOpen = useValue(showLayerPanel);
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

  if (isFocusMode || isMobile || !isOpen) {
    return null;
  }

  return (
    <div className='layer-panel'>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className='layer-panel-title'>Elements</div>
        <button
          style={{
            marginRight: 8,
            marginTop: 4,
            padding: 0,
            border: 'none',
            cursor: 'pointer',
            height: 20,
            width: 20,
          }}
          onClick={(ev) => {
            showLayerPanel.set(false);
            ev.stopPropagation();
          }}
        >
          <CloseIcon fill='black' />
        </button>
      </div>
      <div className='shape-tree'>
        <ShapeList shapeIds={shapeIds} depth={0} />
      </div>
    </div>
  );
}
