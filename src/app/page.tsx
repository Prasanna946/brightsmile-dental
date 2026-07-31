"use client";

import { useState, useEffect, useRef, useSyncExternalStore, FormEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  Star,
  Shield,
  Heart,
  Sparkles,
  Smile,
  Stethoscope,
  AlertCircle,
  Check,
  Send,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  {
    title: "General Checkup",
    description:
      "Comprehensive oral exams with digital X-rays to keep your smile healthy.",
    icon: Stethoscope,
  },
  {
    title: "Teeth Cleaning",
    description:
      "Professional deep cleaning to remove plaque and prevent gum disease.",
    icon: Sparkles,
  },
  {
    title: "Teeth Whitening",
    description:
      "Safe, effective whitening treatments for a noticeably brighter smile.",
    icon: Star,
  },
  {
    title: "Dental Implants",
    description:
      "Permanent, natural-looking tooth replacements that feel and function like your own.",
    icon: Shield,
  },
  {
    title: "Orthodontics",
    description:
      "Braces and clear aligners tailored to straighten your teeth with comfort.",
    icon: Smile,
  },
  {
    title: "Emergency Care",
    description:
      "Same-day urgent dental care so you're never left waiting in pain.",
    icon: Heart,
  },
];

const SERVICE_OPTIONS = [
  "General Checkup",
  "Teeth Cleaning",
  "Teeth Whitening",
  "Dental Implants",
  "Orthodontics",
  "Emergency Care",
  "Other",
];

const CLINIC_PHONE = "+91 63818 71589";
const CLINIC_PHONE_TEL = "+916381871589";
const CLINIC_EMAIL = "hello@brightsmile.dental";
const CLINIC_ADDRESS = "123 Smile Avenue, Suite 200, San Francisco, CA 94102";
const CLINIC_HOURS = [
  "Mon – Fri: 8:00 AM – 6:00 PM",
  "Saturday: 9:00 AM – 3:00 PM",
  "Sunday: Closed",
];

/* ------------------------------------------------------------------ */
/*  Navbar                                                             */
/* ------------------------------------------------------------------ */

function Navbar({ onBookClick }: { onBookClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2">
          <Image
            src="/dental-logo.png"
            alt="BrightSmile Dental"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span
            className={`text-lg font-bold tracking-tight transition-colors ${
              scrolled ? "text-primary" : "text-white"
            }`}
          >
            BrightSmile
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/20 ${
                  scrolled
                    ? "text-slate-700 hover:bg-sky-50 hover:text-primary"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <Button
          onClick={onBookClick}
          className="hidden rounded-full bg-white px-5 text-sm font-semibold text-primary shadow-lg hover:bg-sky-50 md:inline-flex"
        >
          Book Now
        </Button>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`md:hidden ${scrolled ? "text-slate-700" : "text-white"}`}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-white">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-left text-primary">
                <Image
                  src="/dental-logo.png"
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                BrightSmile
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-sky-50 hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
              <Button
                onClick={onBookClick}
                className="mt-4 rounded-full bg-primary text-white hover:bg-primary/90"
              >
                Book Appointment
              </Button>
              <a
                href={`tel:${CLINIC_PHONE_TEL}`}
                className="mt-2 flex items-center justify-center gap-2 rounded-full border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-sky-50"
              >
                <Phone className="h-4 w-4" />
                Call Us
              </a>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero — Full-screen 3D Immersive Background                          */
/* ------------------------------------------------------------------ */

function HeroSection({ onBookClick }: { onBookClick: () => void }) {
  return (
    <section
      id="home"
      className="hero-3d-bg relative flex min-h-[100dvh] items-center overflow-hidden"
    >
      {/* 3D drifting background image */}
      <div className="hero-bg-layer absolute inset-0">
        <Image
          src="/hero-3d.png"
          alt="BrightSmile Dental — Modern 3D dental care environment"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Multi-layer gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/35 via-sky-900/20 to-slate-900/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-sky-900/45 via-transparent to-cyan-900/30" />

      {/* Small floating spark particles */}
      <div className="hero-sparks z-[1]">
        {[
          { w: 3,  h: 3, top: "12%", left: "8%",  dur: 4.5, delay: 0,   color: "rgba(186,230,253,0.9)" },
          { w: 2,  h: 2, top: "25%", left: "22%", dur: 6,   delay: 1.2, color: "rgba(125,211,252,0.8)" },
          { w: 4,  h: 4, top: "18%", left: "55%", dur: 5,   delay: 0.6, color: "rgba(255,255,255,0.7)" },
          { w: 2,  h: 2, top: "35%", left: "75%", dur: 7,   delay: 2,   color: "rgba(186,230,253,0.6)" },
          { w: 3,  h: 3, top: "50%", left: "15%", dur: 5.5, delay: 0.8, color: "rgba(103,232,249,0.8)" },
          { w: 2,  h: 2, top: "65%", left: "60%", dur: 6.5, delay: 1.8, color: "rgba(255,255,255,0.6)" },
          { w: 3,  h: 3, top: "70%", left: "35%", dur: 4,   delay: 3,   color: "rgba(125,211,252,0.7)" },
          { w: 2,  h: 2, top: "80%", left: "80%", dur: 5.8, delay: 0.4, color: "rgba(186,230,253,0.5)" },
          { w: 3,  h: 3, top: "45%", left: "90%", dur: 4.8, delay: 2.5, color: "rgba(103,232,249,0.7)" },
          { w: 2,  h: 2, top: "55%", left: "42%", dur: 7.2, delay: 1.5, color: "rgba(255,255,255,0.5)" },
          { w: 4,  h: 4, top: "30%", left: "92%", dur: 5.2, delay: 0.9, color: "rgba(125,211,252,0.6)" },
          { w: 2,  h: 2, top: "75%", left: "10%", dur: 6.2, delay: 3.2, color: "rgba(186,230,253,0.8)" },
        ].map((s, i) => (
          <div
            key={i}
            className="hero-spark"
            style={{
              width: s.w,
              height: s.h,
              top: s.top,
              left: s.left,
              background: s.color,
              boxShadow: `0 0 ${s.w * 2}px ${s.color}`,
              animation: `${i % 2 === 0 ? 'spark-float' : 'spark-float-alt'} ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Particle grid overlay */}
      <div className="hero-particles absolute inset-0 z-[1]" />

      {/* Shimmer sweep effect */}
      <div className="hero-shimmer z-[2]" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="trust-badge trust-badge-glow mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider text-white/90 uppercase"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Accepting New Patients
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-6 text-4xl leading-[1.1] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Your Smile
              <br />
              Deserves{" "}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-sky-300 bg-clip-text text-transparent">
                Gentle Care
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-8 max-w-lg text-lg leading-relaxed text-white/75 sm:text-xl"
            >
              Modern dentistry powered by 3D imaging and AI-assisted diagnostics.
              Experience pain-free, precision dental care in a relaxing environment.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Button
                size="lg"
                onClick={onBookClick}
                className="group relative overflow-hidden rounded-full bg-white px-8 text-base font-semibold text-sky-700 shadow-2xl shadow-sky-900/20 transition-all hover:shadow-3xl hover:shadow-sky-800/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center">
                  Book Appointment
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
              <a
                href={`tel:${CLINIC_PHONE_TEL}`}
                className="hero-glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/15 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            </motion.div>
          </motion.div>

          {/* Right: Glassmorphism trust card */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -8 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <div className="hero-glass rounded-3xl p-8">
              {/* Rating row */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Shield className="h-6 w-6 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-white/60">
                    4.9 rating from 2,400+ reviews
                  </p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Sparkles, label: "3D Imaging", value: "Advanced" },
                  { icon: Heart, label: "Patients", value: "15,000+" },
                  { icon: Shield, label: "Safety", value: "100%" },
                  { icon: Stethoscope, label: "Experience", value: "20+ Years" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                    className="trust-badge rounded-2xl p-4 text-center"
                  >
                    <stat.icon className="mx-auto mb-2 h-5 w-5 text-sky-300" />
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/50">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Certification bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white/5 py-3"
              >
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <span className="text-xs font-medium text-white/60">
                  ISO 9001:2015 Certified &middot; NABH Accredited
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--dental-bg)] to-transparent z-[3]" />

      {/* Scroll hint */}
      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1"
          >
            <div className="h-2 w-1 rounded-full bg-white/60" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */

function ServicesSection() {
  return (
    <section id="services" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <span className="mb-2 inline-block text-sm font-semibold tracking-wider text-primary uppercase">
            What We Offer
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Our Dental Services
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-500">
            Comprehensive care for the whole family, using the latest technology
            in a comfortable, anxiety-free setting.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-sky-100"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  About                                                              */
/* ------------------------------------------------------------------ */

function AboutSection() {
  return (
    <section id="about" className="bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/dental-hero.png"
                alt="BrightSmile Dental Clinic"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-6 -right-4 rounded-xl bg-white p-4 shadow-lg sm:-right-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">15k+</p>
                  <p className="text-xs text-slate-500">Happy Patients</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="mb-2 inline-block text-sm font-semibold tracking-wider text-primary uppercase">
              About Us
            </span>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Caring for Smiles Since 2005
            </h2>
            <p className="mb-4 leading-relaxed text-slate-600">
              BrightSmile Dental was founded with a simple mission: make quality
              dental care comfortable, accessible, and even enjoyable. Our team
              of experienced dentists and hygienists combines the latest
              technology with a genuinely warm approach.
            </p>
            <p className="mb-8 leading-relaxed text-slate-600">
              Whether you&apos;re visiting for a routine cleaning or a complete
              smile transformation, we take the time to listen, explain every
              step, and ensure you feel at ease from the moment you walk in.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "20+", label: "Years Experience" },
                { value: "8", label: "Expert Dentists" },
                { value: "4.9", label: "Star Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Appointment Form                                                   */
/* ------------------------------------------------------------------ */

interface FormData {
  name: string;
  phone: string;
  email: string;
  service: string;
  preferredDate: string;
  message: string;
}

function AppointmentSection({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    service: "",
    preferredDate: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.phone.trim()) e.phone = "Please enter your phone number.";
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter a valid 10-digit Indian number.";
    if (!form.email.trim()) {
      e.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email.";
    }
    if (!form.service) e.service = "Please select a service.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: `+91 ${form.phone}`,
          email: form.email,
          service: form.service,
          preferredDate: form.preferredDate || undefined,
          message: form.message || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Submission failed",
          description: data.error || "Please check the form and try again.",
          variant: "destructive",
        });
        return;
      }

      setSubmitted(true);

      if (data.emailSent) {
        toast({
          title: "Appointment requested!",
          description: `We'll confirm your ${form.service} appointment shortly.`,
        });
      } else if (data.emailConfigured) {
        toast({
          title: "Appointment saved!",
          description: "Email delivery failed, but we have your details. We'll call you to confirm.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Appointment saved!",
          description: "We'll contact you shortly to confirm your " + form.service + " appointment.",
        });
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <section
      id="appointment"
      ref={sectionRef}
      className="bg-white py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <span className="mb-2 inline-block text-sm font-semibold tracking-wider text-primary uppercase">
            Get Started
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Request an Appointment
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-500">
            Fill out the form below and we&apos;ll get back to you within one
            business day to confirm your visit.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-2xl"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center rounded-2xl border border-emerald-100 bg-emerald-50 p-10 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  Request Received!
                </h3>
                <p className="mb-6 text-slate-600">
                  Thank you, {form.name}. We&apos;ll contact you shortly to
                  confirm your {form.service} appointment.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      name: "",
                      phone: "",
                      email: "",
                      service: "",
                      preferredDate: "",
                      message: "",
                    });
                  }}
                >
                  Submit Another Request
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg sm:p-8"
                noValidate
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className={errors.name ? "border-red-400" : ""}
                    />
                    {errors.name && (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-0">
                      <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground select-none">
                        +91
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="98765 43210"
                        value={form.phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                          updateField("phone", digits);
                        }}
                        className={`rounded-l-none ${errors.phone ? "border-red-400" : ""}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={errors.email ? "border-red-400" : ""}
                    />
                    {errors.email && (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Service */}
                  <div className="space-y-1.5">
                    <Label htmlFor="service">
                      Service <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={form.service}
                      onValueChange={(v) => updateField("service", v)}
                    >
                      <SelectTrigger
                        id="service"
                        className={errors.service ? "border-red-400" : ""}
                      >
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.service && (
                      <p className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        {errors.service}
                      </p>
                    )}
                  </div>

                  {/* Preferred Date */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="date">Preferred Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.preferredDate}
                      onChange={(e) =>
                        updateField("preferredDate", e.target.value)
                      }
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="message">Additional Notes</Label>
                    <textarea
                      id="message"
                      rows={3}
                      placeholder="Any concerns or special requests…"
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full rounded-full py-6 text-base font-semibold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Request Appointment
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact / Info Bar                                                  */
/* ------------------------------------------------------------------ */

function ContactSection() {
  return (
    <section id="contact" className="bg-sky-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <span className="mb-2 inline-block text-sm font-semibold tracking-wider text-primary uppercase">
            Visit Us
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Get in Touch
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-500">
            We&apos;d love to hear from you. Reach out anytime — our
            friendly team is ready to help.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="rounded-2xl bg-white p-6 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">Phone</h3>
            <a
              href={`tel:${CLINIC_PHONE_TEL}`}
              className="text-primary hover:underline"
            >
              {CLINIC_PHONE}
            </a>
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white p-6 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">
              Email
            </h3>
            <a
              href={`mailto:${CLINIC_EMAIL}`}
              className="text-primary hover:underline"
            >
              {CLINIC_EMAIL}
            </a>
          </motion.div>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white p-6 text-center shadow-sm sm:col-span-2 lg:col-span-1"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-900">
              Address
            </h3>
            <p className="text-sm text-slate-600">{CLINIC_ADDRESS}</p>
          </motion.div>
        </div>

        {/* Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 rounded-2xl bg-white p-6 text-center shadow-sm"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">
            Office Hours
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {CLINIC_HOURS.map((h) => (
              <p key={h} className="text-sm text-slate-600">
                {h}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating Click-to-Call Button                                      */
/* ------------------------------------------------------------------ */

function FloatingCallButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          href={`tel:${CLINIC_PHONE_TEL}`}
          aria-label="Call BrightSmile Dental"
          className="phone-pulse fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
        >
          <Phone className="h-6 w-6" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Image
                src="/dental-logo.png"
                alt="BrightSmile Dental"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-lg font-bold">BrightSmile</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Modern dentistry with a gentle touch. Your comfort and smile are
              our top priorities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#appointment"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Book Appointment
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider uppercase">
              Services
            </h4>
            <ul className="space-y-2">
              {SERVICES.slice(0, 4).map((s) => (
                <li key={s.title}>
                  <span className="text-sm text-slate-400">{s.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider uppercase">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                <a
                  href={`tel:${CLINIC_PHONE_TEL}`}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  {CLINIC_PHONE}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                <a
                  href={`mailto:${CLINIC_EMAIL}`}
                  className="text-sm text-slate-400 hover:text-white"
                >
                  {CLINIC_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                <span className="text-sm text-slate-400">
                  {CLINIC_ADDRESS}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-center">
 <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} BrightSmile Dental. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const emptySubscribe = () => () => {};

export default function HomePage() {
  const appointmentRef = useRef<HTMLDivElement>(null);

  // Client-only: server renders null, client renders full page.
  // Prevents hydration mismatches from browser extensions (e.g. Grammarly).
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const scrollToAppointment = () => {
    appointmentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onBookClick={scrollToAppointment} />
      <main className="flex-1">
        <HeroSection onBookClick={scrollToAppointment} />
        <ServicesSection />
        <AboutSection />
        <AppointmentSection sectionRef={appointmentRef} />
        <ContactSection />
      </main>
      <Footer />
      <FloatingCallButton />
    </div>
  );
}
