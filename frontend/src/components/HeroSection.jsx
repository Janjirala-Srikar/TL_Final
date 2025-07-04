import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useInViewport from "../hooks/useInViewport";

const HeroSection = () => {
  const navigate = useNavigate();
  const [titleRef, isTitleInViewport] = useInViewport();
  const [subtitleRef, isSubtitleInViewport] = useInViewport();
  const [descriptionRef, isDescriptionInViewport] = useInViewport();

  return (
    <motion.div
      className="relative z-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 overflow-hidden pt-20"
      initial={{ filter: "blur(10px)" }}
      animate={{ filter: "blur(0px)" }}
      transition={{ duration: 1.2, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        className="container px-4 py-12 mx-auto max-w-7xl relative z-20"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="grid lg:grid-cols-[2fr_1fr] gap-12 items-center min-h-[480px]">
          {/* Left Content - Wider to accommodate warning text */}
          <motion.div
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative z-10 text-left lg:text-left"
          >
            {/* Main headline with Poppins font */}
            <motion.h1
              className="font-poppins text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-medium tracking-tight mb-6 leading-[1.1] overflow-visible"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span
                ref={titleRef}
                className={`brand-heading-primary hover-gradient-text italic pr-2 ${isTitleInViewport ? 'in-viewport' : ''}`}
                style={{ display: 'inline-block' }}
              >
                tech
              </span>
              <br />
              <span
                ref={subtitleRef}
                className={`brand-heading-secondary hover-gradient-text ${isSubtitleInViewport ? 'in-viewport' : ''}`}
              >
                LEARN
              </span>
            </motion.h1>

            {/* Warning Text - Right Below Heading in Left Column */}
            <motion.p
              className="font-poppins text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 hover-gradient-text max-w-full break-words"
              initial={{ filter: "blur(4px)" }}
              animate={{ filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Warning: Coding skills may cause sudden job offers and inflated Git pushes.
            </motion.p>
          </motion.div>

          {/* Right Side - Empty for now */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            {/* Space reserved for future content */}
          </motion.div>
        </div>

        {/* Technology Icons Marquee - Bottom Center */}
        <motion.div
          className="w-full overflow-hidden mt-12 pb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="relative">
            {/* Marquee container */}
            <motion.div
              className="flex space-x-16 md:space-x-20 lg:space-x-24"
              animate={{
                x: [0, -100 * 6] // 6 technologies * 100px movement
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
              style={{
                width: `${18 * 120}px` // 3 sets of 6 technologies
              }}
            >
              {/* First set */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex-shrink-0"
              >
                <img
                  src="/html.png"
                  alt="HTML5"
                  className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex-shrink-0"
              >
                <img
                  src="/css.png"
                  alt="CSS3"
                  className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex-shrink-0"
              >
                <img
                  src="/js.png"
                  alt="JavaScript"
                  className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex-shrink-0"
              >
                <img
                  src="/python.png"
                  alt="Python"
                  className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex-shrink-0"
              >
                <img
                  src="/java.png"
                  alt="Java"
                  className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex-shrink-0"
              >
                <img
                  src="/c.png"
                  alt="C Programming"
                  className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg"
                />
              </motion.div>

              {/* Second set (duplicate for seamless loop) */}
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/html.png" alt="HTML5" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/css.png" alt="CSS3" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/js.png" alt="JavaScript" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/python.png" alt="Python" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/java.png" alt="Java" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/c.png" alt="C Programming" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>

              {/* Third set (duplicate for seamless loop) */}
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/html.png" alt="HTML5" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/css.png" alt="CSS3" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/js.png" alt="JavaScript" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/python.png" alt="Python" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/java.png" alt="Java" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1, y: -5 }} className="flex-shrink-0">
                <img src="/c.png" alt="C Programming" className="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-lg" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default HeroSection;
