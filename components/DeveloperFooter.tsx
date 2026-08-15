'use client';

import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function DeveloperFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="mt-12 pt-6 border-t border-border/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>© {currentYear} AETHRA STREAM</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-mono">
              v1.0.0
            </span>
            <span className="px-2 py-0.5 rounded bg-success/10 text-success font-mono">
              Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-text-muted hover:text-text-primary"
            >
              <Github className="w-4 h-4" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-text-muted hover:text-text-primary"
            >
              <Twitter className="w-4 h-4" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-text-muted hover:text-text-primary"
            >
              <Linkedin className="w-4 h-4" />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
