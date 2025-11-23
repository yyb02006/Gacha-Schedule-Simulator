import { motion } from 'motion/react';

export default function DragIndicator() {
  return (
    <motion.div
      tabIndex={-1}
      key="modal-backdrop"
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: -40 }}
      exit={{ opacity: 0, y: 0 }}
      className="pointer-events-none fixed top-0 left-0 z-1000 h-screen w-screen backdrop-blur-sm"
    >
      <div className="absolute inset-0 flex items-center justify-center rounded-b-lg bg-[#00050] backdrop-blur-sm">
        <div className="relative flex size-[100px]">
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
            <defs>
              <mask id="innerMask" maskUnits="userSpaceOnUse">
                <rect width="100%" height="100%" fill="white" />
                <rect x="10%" y="10%" width="80%" height="80%" fill="black" />
              </mask>
            </defs>
          </svg>
          <svg width="100%" height="100%">
            <defs>
              <radialGradient id="grad1" cx="50%" cy="50%" r="65%">
                <stop offset="50%" stopColor="#808080" />
                <stop offset="75%" stopColor="#c0c0c0" />
                <stop offset="100%" stopColor="#ffffff" />
              </radialGradient>
            </defs>
            <rect
              mask="url(#innerMask)"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              fill="url(#grad1)"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
