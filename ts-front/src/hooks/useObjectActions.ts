import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { toggleObject, removeObject } from '../modules/objects';

export default function useObjectActions(id: number) {
  const dispatch = useDispatch();

  const onToggle = useCallback(() => dispatch(toggleObject(id)), [dispatch, id]);
  const onRemove = useCallback(() => dispatch(removeObject(id)), [dispatch, id]);

  return { onToggle, onRemove };
}
