/*
 * SectionContent — Renders the active tab's content with fade+slide transitions.
 * Design: Each section is a glass island with elegant placeholder content.
 */

import type { TabId } from "./TabsNav";
import { useChat } from "@/contexts/ChatContext";
import { useMousePosition } from "@/hooks/useMousePosition";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import LiquidGlassCard from "./LiquidGlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useRef } from "react";

const LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
const BOLD_REGEX = /\*\*(.+?)\*\*/g;
const HEADING_REGEX = /^(#{1,6})\s+(.+)$/;

/** Parses inline markdown (links + bold) in a string and returns React nodes. */
function parseInline(content: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let key = 0;
  // First pass: links
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  LINK_REGEX.lastIndex = 0;
  while ((match = LINK_REGEX.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index);
      parts.push(...parseBoldInText(text, `${keyPrefix}-t-${key++}`));
    }
    const [, label, url] = match;
    parts.push(
      <a
        key={`${keyPrefix}-a-${key++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:opacity-80"
      >
        {label}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push(...parseBoldInText(content.slice(lastIndex), `${keyPrefix}-t-${key++}`));
  }
  return parts.length > 0 ? parts : [content];
}

/** Splits text by **bold** and returns React nodes. */
function parseBoldInText(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let key = 0;
  let lastIndex = 0;
  BOLD_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = BOLD_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <React.Fragment key={`${keyPrefix}-${key++}`}>
          {text.slice(lastIndex, match.index)}
        </React.Fragment>
      );
    }
    parts.push(
      <strong key={`${keyPrefix}-b-${key++}`} className="font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(
      <React.Fragment key={`${keyPrefix}-${key++}`}>
        {text.slice(lastIndex)}
      </React.Fragment>
    );
  }
  return parts.length > 0 ? parts : [text];
}

/** Parses markdown in message content: # headings, **bold**, [text](url). Preserves newlines. */
function parseMessageContent(content: string): React.ReactNode {
  if (!content?.trim()) return content;
  const lines = content.split("\n");
  const result: React.ReactNode[] = [];
  const baseKey = `md-${content.length}-${lines.length}`;
  lines.forEach((line, i) => {
    if (i > 0) result.push(<br key={`${baseKey}-br-${i}`} />);
    const headingMatch = line.match(HEADING_REGEX);
    if (headingMatch) {
      const [, hashes, rest] = headingMatch;
      const level = Math.min(hashes.length, 6);
      const headingClass = cn(
        "font-bold mt-2 mb-1 first:mt-0",
        level === 1 && "text-base",
        level >= 2 && "text-sm"
      );
      const inner = parseInline(rest.trim(), `${baseKey}-${i}`);
      if (level === 1) {
        result.push(<h1 key={`${baseKey}-h-${i}`} className={headingClass}>{inner}</h1>);
      } else if (level === 2) {
        result.push(<h2 key={`${baseKey}-h-${i}`} className={headingClass}>{inner}</h2>);
      } else if (level === 3) {
        result.push(<h3 key={`${baseKey}-h-${i}`} className={headingClass}>{inner}</h3>);
      } else {
        result.push(<h4 key={`${baseKey}-h-${i}`} className={headingClass}>{inner}</h4>);
      }
    } else {
      result.push(
        <React.Fragment key={`${baseKey}-l-${i}`}>
          {parseInline(line, `${baseKey}-${i}`)}
        </React.Fragment>
      );
    }
  });
  return result;
}
import {
  Brain,
  Salad,
  Code2,
  Gamepad,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Terminal,
  Phone,
  X,
  GitBranch,
  Zap,
  LayoutDashboard,
} from "lucide-react";

interface SectionContentProps {
  activeTab: TabId;
}

const sectionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/* ---- Profile Section ---- */
function ProfileSection() {
  const reducedMotion = usePrefersReducedMotion();
  const mouse = useMousePosition({ disabled: reducedMotion });

  const socials = [
    { label: "GitHub", href: "https://github.com/kuruwasenaide", icon: <Github className="w-4 h-4" /> },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/kauemoreirak/", icon: <Linkedin className="w-4 h-4" /> },
  ];
  const badges = [
    "Cyber Systems",
    "AI Architect",
    "Fullstack Ops",
    "Automation Nerd",
    "Game UI",
    "Low Latency",
  ];
  const particles = [
    { left: "8%", top: "16%", delay: 0.1 },
    { left: "22%", top: "8%", delay: 0.8 },
    { left: "34%", top: "20%", delay: 1.4 },
    { left: "52%", top: "10%", delay: 2.1 },
    { left: "70%", top: "18%", delay: 0.4 },
    { left: "84%", top: "9%", delay: 1.9 },
    { left: "12%", top: "74%", delay: 2.4 },
    { left: "28%", top: "82%", delay: 0.5 },
    { left: "46%", top: "78%", delay: 1.3 },
    { left: "63%", top: "84%", delay: 2.8 },
    { left: "77%", top: "74%", delay: 1.6 },
    { left: "90%", top: "82%", delay: 0.9 },
  ];

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reducedMotion
        ? { duration: 0.2 }
        : { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };
  const cursorX = 50 + mouse.normalizedX * 12;
  const cursorY = 50 + mouse.normalizedY * 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="mx-auto max-w-3xl"
    >
      <LiquidGlassCard elevated className="relative overflow-hidden p-6 sm:p-8 md:p-10">
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <motion.div
            className="absolute -left-12 -top-20 h-52 w-52 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.2), transparent 72%)" }}
            animate={reducedMotion ? undefined : { x: [0, 18, -10, 0], y: [0, 10, -8, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-28 right-[-2.5rem] h-64 w-64 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(210,210,210,0.18), transparent 70%)" }}
            animate={reducedMotion ? undefined : { x: [0, -20, 10, 0], y: [0, -14, 8, 0] }}
            transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${cursorX}% ${cursorY}%, rgba(255,255,255,0.14), transparent 38%)`,
              transition: "background 180ms linear",
            }}
          />
          {particles.map((particle, index) => (
            <motion.span
              key={`${particle.left}-${particle.top}`}
              className="absolute h-1 w-1 rounded-full bg-white/55"
              style={{ left: particle.left, top: particle.top }}
              animate={reducedMotion ? undefined : { opacity: [0.15, 0.7, 0.2], y: [0, -8, 0], scale: [1, 1.5, 1] }}
              transition={{
                duration: 2.6 + (index % 4) * 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: particle.delay,
              }}
            />
          ))}
        </div>

        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="relative z-[4] flex flex-col items-center text-center"
        >
          <motion.div variants={itemVariants} className="relative mb-5">
            <motion.div
              className="absolute inset-[-8px] rounded-full"
              style={{
                background: "conic-gradient(from 120deg, rgba(255,255,255,0.5), rgba(185,185,185,0.45), rgba(255,255,255,0.5))",
                filter: "blur(0.5px)",
              }}
              animate={reducedMotion ? undefined : { rotate: [0, 360] }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative rounded-full shadow-[0_0_55px_rgba(255,255,255,0.22)]">
              <Avatar className="h-24 w-24 border-white/20 shadow-2xl sm:h-28 sm:w-28">
                <AvatarImage src="/profile.jpeg" alt="Kauê Moreira profile picture" />
                <AvatarFallback className="bg-white/10 text-base font-semibold text-foreground">
                  KM
                </AvatarFallback>
              </Avatar>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/70 sm:text-xs">
              Offline
            </p>
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              Kauê Moreira
            </h2>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {socials.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={reducedMotion ? undefined : { y: -2, scale: 1.03 }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-foreground/90 transition-all duration-300 hover:border-white/40 hover:text-foreground sm:text-sm"
              >
                <span className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                  {social.icon}
                </span>
                {social.label}
              </motion.a>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-foreground/85"
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </LiquidGlassCard>
    </motion.div>
  );
}

/* ---- Me Section ---- */
function MeSection() {
  const coreValues = [
    {
      title: "Inovacao pratica",
      description:
        "Usar tecnologia e inteligencia artificial para resolver problemas reais e gerar resultados concretos.",
    },
    {
      title: "Eficiencia e simplicidade",
      description:
        "Criar sistemas que eliminam desperdicios de tempo, reduzem erros e tornam processos mais rapidos e claros.",
    },
    {
      title: "Foco em resultado",
      description:
        "Cada solucao precisa gerar impacto mensuravel no negocio: produtividade, reducao de custo ou aumento de performance.",
    },
    {
      title: "Escalabilidade",
      description:
        "Desenvolver ferramentas que crescem junto com o negocio e suportam aumento de demanda sem perder eficiencia.",
    },
    {
      title: "Experiencia do usuario",
      description:
        "Construir produtos intuitivos, rapidos e inteligentes que realmente facilitem a vida das pessoas.",
    },
  ];

  return (
    <LiquidGlassCard className="p-6 sm:p-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Sobre mim
          </h2>
        </div>

        <div
          className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent
                     px-4 py-3"
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80 font-semibold">
            Manifesto operacional
          </p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Em cenarios de alta demanda, processos quebram primeiro. A estrategia aqui e simples: instrumentar,
            automatizar e escalar sem sacrificar clareza.
          </p>
        </div>

        <div className="flex justify-between flex-wrap gap-2">
          {["React", "NodeJs", "Tailwind", "React Native", "TypeScript", "SQL"].map(
            (tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium glass-input text-muted-foreground"
              >
                {tag}
              </span>
            )
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]
                       hover:bg-[var(--glass-bg-hover)] transition-all duration-200
                       hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold">Missao</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Transformar processos complexos em solucoes simples e inteligentes atraves da IA, ajudando
              empresas a ganhar eficiencia, reduzir custos e escalar operacoes com tecnologia aplicada de forma pratica.
            </p>
          </div>

          <div
            className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]
                       hover:bg-[var(--glass-bg-hover)] transition-all duration-200
                       hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold">Visao</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Ser referencia no desenvolvimento de solucoes inteligentes que integram inteligencia artificial
              ao dia a dia das empresas, criando sistemas que ampliam produtividade, tomada de decisao e experiencia do usuario.
            </p>
          </div>

          <div
            className="sm:col-span-2 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]
                       hover:bg-[var(--glass-bg-hover)] transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold">Valores</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {coreValues.map((value) => (
                <div
                  key={value.title}
                  className="rounded-lg border border-primary/10 bg-primary/[0.03] px-3 py-2
                             hover:border-primary/25 transition-colors"
                >
                  <p className="text-xs font-semibold text-foreground">{value.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LiquidGlassCard>
  );
}

/* ---- Projects Section ---- */
function ProjectsSection() {
  const projects = [
    {
      title: "Diana - Assistente de nutrição",
      description: "Diana é uma assistente de IA para alunos da CrossFit889, focada em nutrição e desempenho para CrossFit.",
      tags: ["AI", "Mobile App", "SaaS"],
      icon: <Salad className="w-5 h-5" />,
    },
    {
      title: "Dashboard Personalizada",
      description: "Dashboards customizadas para as necessidades do cliente, com integração e métricas por IA.",
      tags: ["Dashboard", "AI", "Data"],
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "CS:GO Internal Cheat",
      description: "Cheat interno para CS:GO em C++. Experimentação e estudo de técnicas relacionadas à manipulação de ponteiros.",
      tags: ["Reverse Engineering", "Memory", "DirectX"],
      icon: <Gamepad className="w-5 h-5" />,
    },
    {
      title: "E-commerce Fashion",
      description: "Ecommerce para marca de moda, focado em experiência de compra moderna, design minimalista e alta conversão.",
      tags: ["Ecommerce", "Liquid", "UI/UX"],
      icon: <ShoppingBag className="w-5 h-5" />,
    },
  ];

  return (
    <LiquidGlassCard className="p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Meus Projetos
          </h2>
        </div>
        <a
          href="https://github.com/kuruwasenaide"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-medium text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-1"
        >
          Ver mais
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.map((project) => (
          <div
            key={project.title}
            className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]
                       hover:bg-[var(--glass-bg-hover)] transition-all duration-200
                       hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                {project.icon}
              </div>
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{project.title}</h3>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/5 text-primary/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </LiquidGlassCard>
  );
}

/* ---- Skills Section ---- */
function SkillsSection() {
  const skillGroups = [
    {
      category: "Frontend & Mobile",
      icon: <Code2 className="w-4 h-4" />,
      skills: [
        { name: "React", level: 92 },
        { name: "Next.js", level: 88 },
        { name: "TypeScript", level: 90 },
        { name: "Tailwind CSS", level: 90 },
        { name: "React Native", level: 82 },
      ],
    },
    {
      category: "Backend & APIs",
      icon: <Terminal className="w-4 h-4" />,
      skills: [
        { name: "Node.js", level: 88 },
        { name: "Java / Spring Boot", level: 85 },
        { name: "Python", level: 86 },
        { name: "REST / Streaming APIs", level: 88 },
        { name: "PostgreSQL", level: 80 },
      ],
    },
    {
      category: "IA & Integrações",
      icon: <Brain className="w-4 h-4" />,
      skills: [
        { name: "LLMs (Gemini, GPT)", level: 88 },
        { name: "Chatbots & Assistantes", level: 90 },
        { name: "Dashboards & E-commerce", level: 85 },
        { name: "Computer Vision", level: 78 },
        { name: "MLOps / Pipelines", level: 75 },
      ],
    },
  ];

  return (
    <LiquidGlassCard className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Skills & Expertise
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {skillGroups.map((group) => (
          <div
            key={group.category}
            className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]
                       hover:bg-[var(--glass-bg-hover)] transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="text-primary">{group.icon}</div>
              <h3 className="font-semibold text-sm">{group.category}</h3>
            </div>
            <div className="space-y-3">
              {group.skills.map((skill) => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{skill.name}</span>
                    <span className="text-muted-foreground/60">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, var(--primary), oklch(0.55 0.02 260))",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </LiquidGlassCard>
  );
}

/* ---- Contact Section ---- */
function ContactSection() {
  const links = [
    { icon: <Github className="w-5 h-5" />, label: "GitHub", href: "https://github.com/kuruwasenaide", handle: "@kuruwasenaide" },
    { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", href: "https://www.linkedin.com/in/kauemoreirak/", handle: "in/kauemoreirak" },
    { icon: <Phone className="w-5 h-5" />, label: "Telefone", href: "https://wa.me/+5587991174472/", handle: "(87) 99117-4472" },
    { icon: <Mail className="w-5 h-5" />, label: "Email", href: "mailto:hello@example.com", handle: "contato@kaue.com" },
  ];

  return (
    <LiquidGlassCard className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Dê um toque
        </h2>
      </div>

      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
      Sempre aberto a conversas sobre IA, tecnologia e projetos criativos.
      Sinta-se à vontade para entrar em contato por algum desses canais.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)]
                       hover:bg-[var(--glass-bg-hover)] transition-all duration-200
                       hover:scale-[1.01] active:scale-[0.99] group"
          >
            <div className="text-muted-foreground group-hover:text-primary transition-colors">
              {link.icon}
            </div>
            <div>
              <div className="font-medium text-sm">{link.label}</div>
              <div className="text-xs text-muted-foreground">{link.handle}</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </LiquidGlassCard>
  );
}

/* ---- Chat Section (conversation only; input stays on page) ---- */
function ChatSection() {
  const { messages, isTyping, streamingContent, clearChat, abortGeneration } =
    useChat();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const lastSmoothScrollRef = useRef(0);

  useEffect(() => {
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
    }
    scrollFrameRef.current = requestAnimationFrame(() => {
      const now = Date.now();
      const shouldSmoothScroll =
        streamingContent === null && now - lastSmoothScrollRef.current > 250;
      chatEndRef.current?.scrollIntoView({
        behavior: shouldSmoothScroll ? "smooth" : "auto",
      });
      if (shouldSmoothScroll) {
        lastSmoothScrollRef.current = now;
      }
    });
    return () => {
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, [messages, isTyping, streamingContent]);

  const parsedMessages = useMemo(
    () =>
      messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        rendered:
          msg.role === "assistant" ? parseMessageContent(msg.content) : msg.content,
      })),
    [messages]
  );

  const parsedStreamingContent = useMemo(() => {
    if (!streamingContent) return "\u00a0";
    return parseMessageContent(streamingContent);
  }, [streamingContent]);

  return (
    <LiquidGlassCard className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--glass-border-subtle)]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Conversa</span>
        </div>
        <button
          onClick={clearChat}
          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors"
          aria-label="Clear chat"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="max-h-[360px] overflow-y-auto space-y-3">
        {messages.length === 0 && !isTyping ? (
          <p className="text-sm text-muted-foreground/70 py-6 text-center">
            Envie uma mensagem para iniciar a conversa.
          </p>
        ) : (
          <>
            {parsedMessages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: i === parsedMessages.length - 1 ? 0.05 : 0,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "glass-bubble px-4 py-2.5 max-w-[85%]",
                    msg.role === "user" && "glass-bubble-user"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.rendered}
                  </p>
                </div>
              </motion.div>
            ))}
            {/* Streaming reply: show incremental text as it arrives */}
            {streamingContent !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="glass-bubble px-4 py-2.5 max-w-[85%] flex items-center gap-2">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">
                    {parsedStreamingContent}
                  </p>
                  <button
                    type="button"
                    onClick={abortGeneration}
                    className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
            {/* Typing indicator when waiting for first token */}
            {isTyping && streamingContent === null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="glass-bubble px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </>
        )}
      </div>
    </LiquidGlassCard>
  );
}

/* ---- Main SectionContent ---- */
export default function SectionContent({ activeTab }: SectionContentProps) {
  const sections: Record<TabId, React.ReactNode> = {
    profile: <ProfileSection />,
    about: <MeSection />,
    projects: <ProjectsSection />,
    skills: <SkillsSection />,
    chat: <ChatSection />,
    contact: <ContactSection />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        variants={sectionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {sections[activeTab]}
      </motion.div>
    </AnimatePresence>
  );
}
