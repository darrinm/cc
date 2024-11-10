import { useEditor, useValue } from 'tldraw';
import 'tldraw/tldraw.css';
import { ShapeList } from './ShapeList';
import './layer-panel.css';

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

  if (isFocusMode) {
    return null;
  }

  return (
    <div className='layer-panel'>
      <div className='layer-panel-title'>Elements</div>
      <ShapeList shapeIds={shapeIds} depth={0} />
    </div>
  );
}
