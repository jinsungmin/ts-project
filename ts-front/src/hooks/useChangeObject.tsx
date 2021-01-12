import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { changeObject } from '../modules/objects';

export default function useChangeObject() {
  const dispatch = useDispatch();
  return useCallback((id, x, y, lived) => dispatch(changeObject({id:id, x:x, y:y, lived:lived})), [dispatch]);
}