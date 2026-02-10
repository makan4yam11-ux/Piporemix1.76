import pipoImage from "@assets/Screenshot_2025-09-08-20-34-41-80_99c04817c0de5652397fc8b56c3b3817_1757338496783.jpg";
import { motion } from "framer-motion";

interface PipoMascotProps {
  size?: "small" | "medium" | "large" | "xl";
  expression?: "happy" | "excited" | "neutral" | "concerned";
  className?: string;
  isIdle?: boolean;
  isRunning?: boolean;
}

export default function PipoMascot({ 
  size = "medium", 
  expression = "happy", 
  className = "",
  isIdle = true,
  isRunning = false
}: PipoMascotProps) {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-40 h-40",
    xl: "w-64 h-64",
  };

  const getPipoImage = () => {
    return pipoImage;
  };

  const idleVariants = {
    animate: {
      y: [0, -5, 0],
      rotate: [0, -1, 1, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const runningVariants = {
    animate: {
      y: [0, -8, 0],
      rotate: [-5, 5, -5],
      transition: {
        duration: 0.4,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div 
      className={`${sizeClasses[size]} ${className}`} 
      data-testid="pipo-mascot"
      variants={isRunning ? runningVariants : (isIdle ? idleVariants : {})}
      animate="animate"
    >
      <img 
        src={getPipoImage()} 
        alt="Pipo the penguin" 
        className="w-full h-full object-contain rounded-full"
      />
    </motion.div>
  );
}
