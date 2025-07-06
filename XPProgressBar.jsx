import React from 'react';
import { motion } from 'framer-motion';

const XPProgressBar = ({ current, max, level }) => {
  const percentage = (current / max) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">Level {level}</span>
        <span className="text-xs text-gray-400">
          {current} / {max} XP
        </span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default XPProgressBar;