'use client';

import { ReactNode } from 'react';
import { Draggable } from '@hello-pangea/dnd';

interface DraggableCardProps {
  children: ReactNode;
  index: number;
  id: string;
}

export function DraggableCard({ children, index, id }: DraggableCardProps) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
          className={snapshot.isDragging ? 'z-50' : ''}
        >
          {children}
        </div>
      )}
    </Draggable>
  );
}

export default DraggableCard;
