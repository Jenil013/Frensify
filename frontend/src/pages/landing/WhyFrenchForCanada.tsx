// import React from "react";
// import { Link } from "react-router-dom";
// import { motion } from "motion/react";
// import { Check } from "lucide-react";
// import { useScrollReveal } from "../../hooks/useScrollReveal";
// import { PRICING_TIERS } from "./landingConstants";

// // Add <WhyFrenchForCanada /> to your landing page layout
// export default function WhyFrenchForCanada() {
//   const { ref, isInView } = useScrollReveal();

//   return (
//     <section id="pricing" ref={ref} className="py-16 md:py-24 bg-white">
//       <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.5 }}
//           className="text-center mb-12"
//         >
//           <p className="text-[10px] uppercase tracking-widest font-bold text-[#0F47AF] mb-3">
//             Pricing
//           </p>
//           <h2 className="text-2xl md:text-3xl font-bold text-[#37352F] mb-3">
//             Invest in Your Canadian Future
//           </h2>
//           <p className="text-sm text-[#7A7A78] max-w-lg mx-auto">
//             Start free. Upgrade when you're ready to move faster.
//             Every plan is designed around one goal: your CLB target.
//           </p>
//         </motion.div>

//         {/* Social proof bar */}
//         <motion.div
//           initial={{ opacity: 0, y: 12 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.45, delay: 0.1 }}
//           className="flex flex-wrap justify-center gap-6 mb-10"
//         >
//           {[
//             { value: "⭐⭐⭐⭐⭐", label: "Rated 4.9 by learners" },
//             { value: "87%", label: "of learners choose Pro" },
//             { value: "+1–2 CLB", label: "average improvement in 8 weeks" },
//           ].map((item, i) => (
//             <div key={i} className="text-center">
//               <p className="text-sm font-bold text-[#37352F]">{item.value}</p>
//               <p className="text-[10px] text-[#7A7A78]">{item.label}</p>
//             </div>
//           ))}
//         </motion.div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
//           {PRICING_TIERS.map((tier, i) => (
//             <motion.div
//               key={tier.name}
//               initial={{ opacity: 0, y: 24 }}
//               animate={isInView ? { opacity: 1, y: 0 } : {}}
//               transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
//               className={`relative bg-white rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 flex flex-col ${
//                 tier.highlighted
//                   ? "border-[#0F47AF] border-2 shadow-premium-xl"
//                   : "border-[#E9E9E7] shadow-premium hover:shadow-premium-lg"
//               }`}
//             >
//               {tier.badge && (
//                 <span
//                   className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border whitespace-nowrap ${tier.badgeColor}`}
//                 >
//                   {tier.badge}
//                 </span>
//               )}

//               <div className="mb-5 pt-1">
//                 <h3 className="text-base font-bold text-[#37352F] mb-1">
//                   {tier.name}
//                 </h3>
//                 <div className="flex items-baseline gap-1.5">
//                   <span className="text-3xl font-bold text-[#37352F]">
//                     {tier.price}
//                   </span>
//                   <span className="text-xs text-[#7A7A78]">
//                     {tier.period}
//                   </span>
//                 </div>
//                 <p className="text-xs text-[#5F5E5B] mt-2">{tier.tagline}</p>
//               </div>

//               <ul className="space-y-2.5 mb-5 flex-1">
//                 {tier.features.map((feature) => (
//                   <li key={feature} className="flex items-start gap-2.5">
//                     <Check className="w-3.5 h-3.5 text-[#2D6A53] mt-0.5 shrink-0" />
//                     <span className="text-xs text-[#5F5E5B]">{feature}</span>
//                   </li>
//                 ))}
//               </ul>

//               {/* Outcome note */}
//               {tier.result && (
//                 <div className="mb-4 px-3 py-2 rounded-lg bg-[#FAFAF9] border border-[#E9E9E7]">
//                   <p className="text-[10px] text-[#5F5E5B] text-center font-medium">
//                     {tier.result}
//                   </p>
//                 </div>
//               )}

//               <Link
//                 to="/auth?mode=signup"
//                 className={`block w-full text-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
//                   tier.highlighted
//                     ? "bg-[#002D62] hover:bg-[#001D42] text-white shadow-premium"
//                     : "bg-[#37352F] hover:bg-[#1a1917] text-white"
//                 }`}
//               >
//                 {tier.name === "Free" ? "Start Free" : `Get ${tier.name}`}
//               </Link>
//             </motion.div>
//           ))}
//         </div>

//         {/* Reassurance line */}
//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={isInView ? { opacity: 1 } : {}}
//           transition={{ duration: 0.5, delay: 0.5 }}
//           className="text-center text-[11px] text-[#9B9691] mt-8"
//         >
//           No long-term commitment. Cancel anytime. All plans include the placement test.
//         </motion.p>
//       </div>
//     </section>
//   );
// }
