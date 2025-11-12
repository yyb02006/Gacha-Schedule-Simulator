import { useEffect, useState } from 'react';

/**
 * 창 리사이즈 중에 드래그를 일시적으로 비활성화하는 훅
 *
 * @param {number} [delay=100] - 리사이즈 종료 후 드래그 재활성화까지 대기할 시간 (ms)
 * @returns {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} - [dragEnabled, setDragEnabled]
 *
 * @example
 * const [dragEnabled] = useResizeDragToggle(150);
 * <motion.div drag={dragEnabled ? 'x' : false} />
 */
export function useResizeDragToggle(delay: number = 100) {
  const [dragEnabled, setDragEnabled] = useState(true);

  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    // 리사이즈 중에는 드래그 불가능하게
    const handleResize = () => {
      setDragEnabled(false);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setDragEnabled(true);
      }, delay);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [delay]);

  return [dragEnabled, setDragEnabled] as const;
}
