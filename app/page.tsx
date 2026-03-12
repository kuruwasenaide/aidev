"use client";

import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import AvatarFloat from "@/components/AvatarFloat";
import ChatSpotlight from "@/components/ChatSpotlight";
import SectionContent from "@/components/SectionContent";
import TabsNav, { type TabId } from "@/components/TabsNav";
import ThemeToggle from "@/components/ThemeToggle";
import { motion } from "framer-motion";

const DARK_GRADIENT = {
  gradientBackgroundStart: "rgb(0,0,0)",
  gradientBackgroundEnd: "rgb(15,15,15)",
  firstColor: "0,0,0",
  secondColor: "25,25,25",
  thirdColor: "55,55,55",
  fourthColor: "90,90,90",
  fifthColor: "45,45,45",
  pointerColor: "70,70,70",
};

const LIGHT_GRADIENT = {
  gradientBackgroundStart: "rgb(250,250,250)",
  gradientBackgroundEnd: "rgb(238,238,242)",
  firstColor: "220,220,225",
  secondColor: "200,200,210",
  thirdColor: "180,182,195",
  fourthColor: "190,192,200",
  fifthColor: "210,210,218",
  pointerColor: "160,162,175",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const { theme } = useTheme();
  const gradient = theme === "dark" ? DARK_GRADIENT : LIGHT_GRADIENT;

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="fixed inset-0 z-[-1]">
        <BackgroundGradientAnimation
          {...gradient}
          size="80%"
          blendingValue="overlay"
          interactive={true}
        />
      </div>

      <main className="relative pt-10 lg:pt-16 z-10 flex-1 flex flex-col px-4 sm:px-6">
        <div className="max-w-xl mx-auto space-y-8 flex-1 w-full">
          {/* <motion.section
            className="text-center space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.p
              className="text-muted-foreground text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
            </motion.p>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]"
              style={{ fontFamily: "var(--font-display)" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground">
                kauê moreira
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              <AvatarFloat />
            </motion.div>
          </motion.section> */}

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <ChatSpotlight onMessageSent={() => setActiveTab("chat")} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <SectionContent activeTab={activeTab} />
          </motion.section>

        </div>
        <motion.footer
          className="py-4 mt-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="max-w-full mx-auto flex items-center justify-between gap-4">
            <span className="flex-1 min-w-0" aria-hidden />
            <p className="text-xs text-muted-foreground/30 text-center shrink-0">
              Desenvolvido por <span className="font-bold">Kauê Moreira</span>
            </p>
            <span className="flex-1 min-w-0 flex justify-end shrink-0">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <ThemeToggle />
              </motion.div>
            </span>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}
