import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scan, Check, X } from 'lucide-react';
import { useWarehouse } from '../hooks/useWarehouseContext';

const ScanInput = ({ 
  onScan, 
  placeholder = "Scan or enter barcode...", 
  expectedValue = null,
  autoFocus = true,
  showResult = true 
}) => {
  const { playSound } = useWarehouse();
  const [value, setValue] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Keep focus on the input
  useEffect(() => {
    if (!autoFocus) return;

    const handleFocus = () => {
      if (inputRef.current && document.activeElement !== inputRef.current && !scanning) {
        inputRef.current.focus();
      }
    };

    // Check focus periodically
    const interval = setInterval(handleFocus, 500);
    
    // Also focus on click anywhere
    const handleClick = (e) => {
      // Don't refocus if clicking on a button or link
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        handleFocus();
      }
    };
    
    document.addEventListener('click', handleClick);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('click', handleClick);
    };
  }, [autoFocus, scanning]);

  const handleScan = (scanValue) => {
    setScanning(true);
    playSound('scan');

    // Faster processing
    setTimeout(() => {
      const isValid = !expectedValue || scanValue === expectedValue;
      
      if (isValid) {
        playSound('success');
        setResult('success');
        onScan(scanValue);
      } else {
        playSound('error');
        setResult('error');
      }

      setScanning(false);
      
      // Much faster clearing
      if (showResult && isValid) {
        setTimeout(() => {
          setResult(null);
          setValue('');
          // Refocus after clearing
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 500); // Reduced from 1500ms
      } else if (showResult && !isValid) {
        // Keep error visible slightly longer
        setTimeout(() => {
          setResult(null);
          setValue('');
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 1000); // Still faster than before
      } else {
        setValue('');
        setResult(null);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }, 200); // Reduced from 300ms
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      handleScan(value.trim());
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value.toUpperCase(); // Auto-uppercase for consistency
    setValue(newValue);
    
    // Auto-submit for common barcode patterns
    // Most warehouse barcodes are 8-14 characters
    if (newValue.length >= 8 && /^[A-Z0-9-]+$/.test(newValue)) {
      // Small delay to capture full barcode
      setTimeout(() => {
        if (value === newValue && newValue.trim()) {
          handleScan(newValue.trim());
        }
      }, 50); // Very short delay
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Scan className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
          scanning ? 'text-blue-500' : 'text-gray-400'
        }`} size={20} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`input-field w-full pl-12 pr-12 transition-all ${
            scanning ? 'border-blue-500 bg-blue-500/10' : ''
          } ${
            result === 'error' ? 'border-red-500 bg-red-500/10' : ''
          } ${
            result === 'success' ? 'border-green-500 bg-green-500/10' : ''
          }`}
          disabled={scanning}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
        
        {scanning && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="spinner w-6 h-6" />
          </div>
        )}

        {result && showResult && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {result === 'success' ? (
              <Check className="text-green-500" size={24} />
            ) : (
              <X className="text-red-500" size={24} />
            )}
          </motion.div>
        )}
      </div>

      {expectedValue && (
        <p className="text-xs text-gray-400 mt-1">
          Expected: <span className="font-mono text-white">{expectedValue}</span>
        </p>
      )}
    </form>
  );
};

export default ScanInput;