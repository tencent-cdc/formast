import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { React } from 'nautil';
import { HTML5Backend } from 'react-dnd-html5-backend';

const DND_TYPES = {
  BASIC: 'basic',
};

export function DragBox(props) {
  const { type = DND_TYPES.BASIC, children, data, canDrag, onDragBegin, onDragEnd, render } = props;
  const [, drag, preview] = useDrag({
    type,
    item(monitor) {
      const cursor = monitor.getClientOffset();
      onDragBegin && onDragBegin(data, cursor);
      return { data };
    },
    canDrag(monitor) {
      const cursor = monitor.getClientOffset();
      return canDrag ? canDrag(data, cursor) : true;
    },
    end(_, monitor) {
      const cursor = monitor.getClientOffset();
      onDragEnd && onDragEnd(data, cursor);
    },
  });

  if (render) {
    return (
      <div ref={preview} className="formast-layout-editor__drag-box--outer">
        {render(drag)}
      </div>
    );
  }

  return (
    <div ref={drag} className="formast-layout-editor__drag-box">
      {children}
    </div>
  );
}

export function DropBox(props) {
  const { type, children, canDrop, onHover, onDrop } = props;
  const [{ isOver, canDrop: canDropCursor }, drop] = useDrop({
    accept: type ? [DND_TYPES.BASIC, type] : DND_TYPES.BASIC,
    canDrop(item, monitor) {
      const cursor = monitor.getClientOffset();
      return canDrop ? canDrop(item.data, cursor) : true;
    },
    hover(item, monitor) {
      const cursor = monitor.getClientOffset(); // 鼠标位置
      onHover && onHover(item.data, cursor);
    },
    drop(item, monitor) {
      const cursor = monitor.getClientOffset();
      onDrop(item.data, cursor);
    },
    collect(monitor) {
      return {
        isOver: !!monitor.isOver(),
        cursor: monitor.getClientOffset(),
        canDrop: monitor.canDrop(),
      };
    },
  });

  const classNames = ['formast-layout-editor__drop-box', isOver && canDropCursor ? 'formast-layout-editor__drop-box--over' : null];
  const className = classNames.filter(item => !!item).join(' ');

  return (
    <div ref={drop} className={className}>
      {children}
    </div>
  );
}

export function DragDropProvider({ children }) {
  return (
    <DndProvider backend={HTML5Backend}>
      {children}
    </DndProvider>
  );
}
