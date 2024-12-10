import { Component, ErrorInfo, ReactNode } from "react";
import Base from "./base";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

interface Props {
  children?: ReactNode;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      error,
    };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("unexpected error:", error, info);
  }

  public render() {
    if (this.state.error !== null) {
      return (
        <Base>
          <motion.div
            className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 10,
              }}
            >
              <FaExclamationTriangle className="text-pink-500 text-6xl mb-4" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-pink-800 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Oops! Something went wrong
            </motion.h2>
            <motion.p
              className="text-lg text-pink-600 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {this.state.error.message}
            </motion.p>
            <motion.button
              className="bg-pink-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
            >
              Try Again
            </motion.button>
          </motion.div>
        </Base>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
