import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import {
  Flame,
  Leaf,
  Check,
  Milk,
  Truck,
  ShieldCheck,
  ThumbsUp,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  ClipboardList,
  Calendar,
  PauseCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import { LANDING_IMAGES } from '../../../constants/images';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { addToCart } = useCart();

  const testimonials = [
    {
      id: 1,
      name: 'Rahul Mehta',
      quote: 'Protein Project changed my eating habits. The custom bowl is an absolute game changer for my daily routine!',
      rating: 5,
      avatar: LANDING_IMAGES.testimonials.rahulMehta,
      tag: 'Fitness Enthusiast'
    },
    {
      id: 2,
      name: 'Sneha Kapoor',
      quote: 'Fresh ingredients, amazing taste and perfect macro control for my weight loss and fitness journey.',
      rating: 5,
      avatar: LANDING_IMAGES.testimonials.snehaKapoor,
      tag: 'Yoga Trainer'
    },
    {
      id: 3,
      name: 'Arjun Verma',
      quote: 'The monthly subscription is so convenient. Daily fresh meals delivered on time, I never miss my macros!',
      rating: 5,
      avatar: LANDING_IMAGES.testimonials.arjunVerma,
      tag: 'Marathon Runner'
    },
    {
      id: 4,
      name: 'Priya Sharma',
      quote: 'Extremely accurate macro breakdown! Helps me hit my 120g daily protein target without any hassle.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      tag: 'CrossFit Athlete'
    },
    {
      id: 5,
      name: 'Vikram Singh',
      quote: 'Cold-pressed juices are so fresh, pure and energizing after intense gym sessions. Highly recommended!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      tag: 'Bodybuilder'
    }
  ];

  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Auto Scroll Timer every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const handleNextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    productsAPI
      .getAll({ limit: 6 })
      .then((res) => {
        if (res.success && Array.isArray(res.products)) {
          setFeaturedProducts(res.products);
        } else {
          setFeaturedProducts([
            { id: 'p1', name: 'High Protein Bowl', price: 249, image: LANDING_IMAGES.popularPicks.highProteinBowl, protein: 42, calories: 480 },
            { id: 'p2', name: 'Paneer Power Bowl', price: 279, image: LANDING_IMAGES.popularPicks.paneerPowerBowl, protein: 38, calories: 510 },
            { id: 'p3', name: 'Quinoa Super Bowl', price: 239, image: LANDING_IMAGES.popularPicks.quinoaSuperBowl, protein: 35, calories: 440 },
            { id: 'p4', name: 'Green Detox Juice', price: 149, image: LANDING_IMAGES.popularPicks.greenDetoxJuice, protein: 2, calories: 95 },
            { id: 'p5', name: 'Beetroot Boost Juice', price: 149, image: LANDING_IMAGES.popularPicks.beetrootBoostJuice, protein: 3, calories: 110 },
            { id: 'p6', name: 'Amla Immunity Shot', price: 99, image: LANDING_IMAGES.popularPicks.amlaImmunityShot, protein: 1, calories: 35 },
          ]);
        }
      })
      .catch(() => {
        setFeaturedProducts([
          { id: 'p1', name: 'High Protein Bowl', price: 249, image: LANDING_IMAGES.popularPicks.highProteinBowl, protein: 42, calories: 480 },
          { id: 'p2', name: 'Paneer Power Bowl', price: 279, image: LANDING_IMAGES.popularPicks.paneerPowerBowl, protein: 38, calories: 510 },
          { id: 'p3', name: 'Quinoa Super Bowl', price: 239, image: LANDING_IMAGES.popularPicks.quinoaSuperBowl, protein: 35, calories: 440 },
          { id: 'p4', name: 'Green Detox Juice', price: 149, image: LANDING_IMAGES.popularPicks.greenDetoxJuice, protein: 2, calories: 95 },
          { id: 'p5', name: 'Beetroot Boost Juice', price: 149, image: LANDING_IMAGES.popularPicks.beetrootBoostJuice, protein: 3, calories: 110 },
          { id: 'p6', name: 'Amla Immunity Shot', price: 99, image: LANDING_IMAGES.popularPicks.amlaImmunityShot, protein: 1, calories: 35 },
        ]);
      });
  }, []);

  // Compute 3 visible cards starting from currentTestimonialIndex
  const visibleTestimonials = [
    testimonials[currentTestimonialIndex],
    testimonials[(currentTestimonialIndex + 1) % testimonials.length],
    testimonials[(currentTestimonialIndex + 2) % testimonials.length],
  ];

  return (
    <PublicLayout>
      {/* 1. HERO SECTION - FULL SCREEN BACKGROUND VIDEO (vvv1.mp4) */}
      <section className="relative w-full min-h-[calc(100vh-80px)] flex items-center overflow-hidden py-12 lg:py-0">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-image.png"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        >
          <source src="/vvv1.mp4" type="video/mp4" />
        </video>

        {/* Soft background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent lg:via-white/70 z-1 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl lg:max-w-2xl space-y-6"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1c4a2b] tracking-tight leading-[1.12]">
              Build Your <span className="text-[#3f7d40]">Protein.</span><br />
              Build Your <span className="text-[#3f7d40]">Lifestyle.</span>
            </h1>

            <p className="text-[#5b6259] text-base sm:text-lg max-w-lg leading-relaxed font-medium">
              High protein. Real ingredients. Custom made for your goals. Eat clean. Stay lean. Live better.
            </p>

            {/* Buttons: Stacked on separate lines on mobile, side-by-side on desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
              <Link
                to="/categories"
                className="btn btn-primary px-7 py-3.5 text-sm sm:text-base font-bold shadow-lift inline-flex items-center justify-center gap-2 w-full sm:w-auto text-center"
              >
                Build Your Bowl <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link
                to="/juices"
                className="btn btn-outline px-7 py-3.5 text-sm sm:text-base bg-white/90 font-bold inline-flex items-center justify-center w-full sm:w-auto text-center"
              >
                Explore Juices
              </Link>
            </div>

            {/* 3 Trust Tags on 1 line on mobile */}
            <div className="flex flex-row items-center justify-between sm:justify-start gap-1.5 sm:gap-4 pt-4 text-[10px] sm:text-xs font-bold text-[#1c211d] w-full">
              <div className="flex items-center gap-1 sm:gap-2 bg-white/90 px-2 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-[#e5e3da] shadow-xs shrink-0">
                <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-[#3f7d40]" />
                <span>High Protein</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-white/90 px-2 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-[#e5e3da] shadow-xs shrink-0">
                <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-[#3f7d40]" />
                <span>100% Fresh</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-white/90 px-2 py-1.5 sm:px-3.5 sm:py-2 rounded-full border border-[#e5e3da] shadow-xs shrink-0">
                <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-400 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-gray-500">
                  ✕
                </span>
                <span>No Preservatives</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Badge Overlay on Top-Right Desktop */}
        <div className="hidden lg:flex absolute top-12 right-12 bg-white/90 backdrop-blur-sm rounded-full w-32 h-32 p-3 shadow-lift border-2 border-dashed border-[#3f7d40] flex-col items-center justify-center text-center animate-bounce-slow">
          <Leaf className="w-6 h-6 text-[#3f7d40] mb-1" />
          <span className="text-xs font-extrabold leading-tight text-[#1c4a2b]">
            Custom<br />High Protein<br />Meals
          </span>
        </div>
      </section>

      {/* 2. WHY CHOOSE US SECTION */}
      <section className="py-16 bg-[#e7efdf]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1c4a2b] tracking-tight mb-2">
            Why Choose Protein Project?
          </h2>
          <p className="text-[#5b6259] text-sm sm:text-base mb-12">
            We make healthy eating simple, tasty and effective.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-[14px] bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center font-bold">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1c4a2b]">High Quality</h3>
              <p className="text-xs text-[#5b6259] leading-relaxed">
                Premium ingredients packed with nutrients
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-[14px] bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center font-bold">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1c4a2b]">Custom Made</h3>
              <p className="text-xs text-[#5b6259] leading-relaxed">
                Build your own bowl as per your goals
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-[14px] bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center font-bold">
                <Milk className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1c4a2b]">Nutrition Driven</h3>
              <p className="text-xs text-[#5b6259] leading-relaxed">
                Balanced meals for better performance
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-[14px] bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1c4a2b]">Delivered Fresh</h3>
              <p className="text-xs text-[#5b6259] leading-relaxed">
                Right to your door, on time
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-[14px] bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1c4a2b]">Clean &amp; Safe</h3>
              <p className="text-xs text-[#5b6259] leading-relaxed">
                No preservatives, no compromise
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-[14px] bg-white shadow-xs hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-[#e7efdf] text-[#3f7d40] flex items-center justify-center font-bold">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-[#1c4a2b]">Loved by Thousands</h3>
              <p className="text-xs text-[#5b6259] leading-relaxed">
                Trusted by fitness lovers across India
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BOWL & JUICES BANNER GRID */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Banner 1: Build Your Own Bowl - Full Background Image */}
            <div
              className="relative border border-[#e5e3da] rounded-[22px] p-8 lg:p-10 bg-cover bg-right bg-no-repeat overflow-hidden shadow-sm flex flex-col justify-between min-h-[260px]"
              style={{ backgroundImage: "url('/protein-bowl-card.png')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-3.5 max-w-xs sm:max-w-sm">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1c4a2b] leading-tight">
                  Build Your Own<br />
                  <span className="text-[#3f7d40]">Protein Bowl</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#5b6259] leading-relaxed font-medium">
                  Choose from a variety of fruits, veggies, sprouts, seeds and more. We'll calculate the perfect nutrition for you.
                </p>
                <div className="pt-2">
                  <Link
                    to="/bowl-builder"
                    className="btn btn-primary btn-sm inline-flex items-center gap-2 shadow-xs"
                  >
                    Start Building <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Banner 2: Sprouts & Protein Bowl - Full Background Image */}
            <div
              className="relative border border-[#e5e3da] rounded-[22px] p-8 lg:p-10 bg-cover bg-right bg-no-repeat overflow-hidden shadow-sm flex flex-col justify-between min-h-[260px]"
              style={{ backgroundImage: "url('/sprouts-protein-card.jpg')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-3.5 max-w-xs sm:max-w-sm">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1c4a2b] leading-tight">
                  Build Your Own<br />
                  <span className="text-[#3f7d40]">Sprouts &amp; Protein</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#5b6259] leading-relaxed font-medium">
                  Select clean sprouts, premium protein toppings, healthy veggies, and power seeds.
                </p>
                <div className="pt-2">
                  <Link
                    to="/sprouts-protein"
                    className="btn btn-primary btn-sm inline-flex items-center gap-2 shadow-xs"
                  >
                    Start Customizing <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Banner 3: Fresh & Healthy Juices - Full Background Image */}
            <div
              className="relative border border-[#e5e3da] rounded-[22px] p-8 lg:p-10 bg-cover bg-right bg-no-repeat overflow-hidden shadow-sm flex flex-col justify-between min-h-[260px]"
              style={{ backgroundImage: "url('/fresh-juices-card.png')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-3.5 max-w-xs sm:max-w-sm">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1c4a2b] leading-tight">
                  Fresh &amp; Healthy<br />
                  <span className="text-[#3f7d40]">Juices</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#5b6259] leading-relaxed font-medium">
                  Boost your energy, detox your body and stay fresh with our premium cold-pressed juices.
                </p>
                <div className="pt-2">
                  <Link
                    to="/juices"
                    className="btn btn-primary btn-sm inline-flex items-center gap-2 shadow-xs"
                  >
                    Explore Juices <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR PICKS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1c4a2b] tracking-tight mb-2">
              Popular Picks
            </h2>
            <p className="text-[#5b6259] text-sm">
              Handpicked favorites loved by our customers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-[14px] p-3 flex flex-col justify-between hover:shadow-md transition-shadow border border-[#e5e3da]"
              >
                <div>
                  <div className="aspect-square w-full rounded-[10px] overflow-hidden mb-3 bg-[#f2f6ee]">
                    <img
                      src={prod.image || LANDING_IMAGES.popularPicks.highProteinBowl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-sm text-[#1c211d] line-clamp-1">
                    {prod.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#e5e3da]">
                  <span className="font-extrabold text-sm text-[#3f7d40]">
                    ₹{prod.price}
                  </span>
                  <button
                    onClick={() => addToCart(prod)}
                    className="text-xs font-bold text-[#3f7d40] hover:underline"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SUBSCRIPTION BANNER */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#12331f] via-[#1c4a2b] to-[#3f7d40] rounded-[22px] px-8 py-8 lg:px-12 lg:py-0 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 shadow-lift border border-[#3f7d40]/30 min-h-[300px]">
            {/* Mobile View: Circular Avatar Frame */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 border-white/20 shadow-lg shrink-0 lg:hidden flex items-center justify-center bg-[#1c4a2b]">
              <img
                src="/fitness-model.png"
                alt="Stay Consistent - Fitness Model"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Desktop View: Full-Height Model Bottom-Flush */}
            <div className="hidden lg:flex shrink-0 items-end justify-start h-80">
              <img
                src="/fitness-model.png"
                alt="Stay Consistent - Fitness Model"
                className="h-80 w-auto object-contain object-bottom drop-shadow-2xl"
              />
            </div>

            {/* Center Content */}
            <div className="space-y-4 text-center lg:text-left max-w-md">
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
                Stay Consistent.<br />
                <span className="text-[#e7efdf]">Get Real Results.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#e7efdf]/90 leading-relaxed font-medium">
                Subscribe to our monthly meal plans and stay on track with your fitness goals.
              </p>
              <div className="pt-2">
                <Link
                  to="/subscription"
                  className="btn btn-outline bg-white text-[#12331f] border-white hover:bg-gray-100 btn-sm inline-flex items-center gap-2 font-bold shadow-md"
                >
                  Explore Subscription <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right 3 Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-5 text-left shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white">Customized Plans</h4>
                  <p className="text-[11px] text-[#c9d6c4]">As per your goals</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white">Daily Fresh Meals</h4>
                  <p className="text-[11px] text-[#c9d6c4]">Delivered on time</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <PauseCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white">Pause or Resume</h4>
                  <p className="text-[11px] text-[#c9d6c4]">Anytime easily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS - CENTER ALIGNED HEADER & INTERACTIVE CONTROLS */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center mb-12 relative">
            <span className="kit-section-label mb-2">Customer Reviews</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1c4a2b] tracking-tight">
              What Our Customers Say
            </h2>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 mt-4 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
              <button
                onClick={handlePrevTestimonial}
                className="w-11 h-11 rounded-full border border-[#e5e3da] bg-white flex items-center justify-center text-[#1c4a2b] hover:bg-[#3f7d40] hover:text-white hover:border-[#3f7d40] transition-all shadow-xs cursor-pointer active:scale-95"
                title="Previous Testimonial"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextTestimonial}
                className="w-11 h-11 rounded-full border border-[#e5e3da] bg-white flex items-center justify-center text-[#1c4a2b] hover:bg-[#3f7d40] hover:text-white hover:border-[#3f7d40] transition-all shadow-xs cursor-pointer active:scale-95"
                title="Next Testimonial"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Testimonial Cards Grid with Smooth Transition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleTestimonials.map((item, idx) => (
              <motion.div
                key={`${item.id}-${currentTestimonialIndex}-${idx}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`bg-white p-6 rounded-[16px] border border-[#e5e3da] shadow-xs flex-col justify-between space-y-4 hover:shadow-md hover:border-[#3f7d40]/40 transition-all ${idx === 0 ? 'flex' : 'hidden md:flex'}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#e8a33d]">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#e8a33d]" />
                      ))}
                    </div>
                    <span className="badge badge-green text-[10px] font-bold">{item.tag}</span>
                  </div>
                  <p className="text-xs text-[#1c211d] leading-relaxed font-medium italic">
                    "{item.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-[#e5e3da]/60">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#3f7d40]/30 shadow-xs"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#1c4a2b]">{item.name}</h4>
                    <span className="text-[10px] text-[#5b6259] font-medium">Verified Customer</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination Indicators / Dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonialIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentTestimonialIndex
                    ? 'w-8 bg-[#3f7d40]'
                    : 'w-2.5 bg-[#e5e3da] hover:bg-[#5b6259]'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
