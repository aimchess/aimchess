"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
    Trophy, Crown, Target, Brain, Sparkles, 
    Quote, Star, Medal, Heart, BookOpen, GraduationCap 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AchievementsSection } from "@/components/achievements-section";

// All 12 stories listed individually
const ALL_STORIES = [
    {
        name: "Agnee Akshay Varma",
        parents: "Athira Nampiathiri & Akshay Varma",
        image: "/ach1.jpeg",
        tag: "Character & Resilience",
        quote: "No matter how many games he loses, he never gives up.",
        description: "Agnee’s journey has shaped his personality, developing deep focus and the ability to spend time in thought. Even with a tear or two, he completes every game—a personal victory far greater than any win on the board.",
        impact: "Emotional Strength"
    },
    {
        name: "Vishnupriya R Pai",
        parents: "Anu Pai",
        image: "/ach2.jpeg",
        tag: "Academic Growth",
        quote: "Within months of joining, she began winning several tournament prizes.",
        description: "Chess has significantly improved Vishnupriya's concentration, which has reflected positively in her school performance. The academy’s support has been a major pillar in her rapid progress.",
        impact: "Prize Winner"
    },
    {
        name: "Aadhvik G Kamath",
        parents: "Radhika Gopeekrishnan",
        image: "/ach3.jpeg",
        tag: "Tournament Champion",
        quote: "Became a champion in academy tournaments in the Sub-Junior category.",
        description: "Starting from scratch, Aadhvik's continuous effort and training helped him secure multiple championship titles. He thrives in our positive and dedicated learning environment.",
        impact: "Multiple-time Champ"
    },
    {
        name: "Akshith G Kamath",
        parents: "Radhika Gopeekrishnan",
        image: "/ach4.jpeg",
        tag: "Skill Development",
        quote: "Visible improvement in chess skills and self-confidence.",
        description: "Akshith has shown remarkable growth in his technical play. His journey at the academy is a testament to how dedication and encouragement can build a child's confidence on and off the board.",
        impact: "Rising Star"
    },
    {
        name: "Devanaath A",
        parents: "Suvarna",
        image: "/ach5.jpeg",
        tag: "Self-Motivation",
        quote: "He learned to accept defeat and identify his own mistakes.",
        description: "Once easily upset by losses, Devanaath is now a confident player. He has developed the maturity to analyze his errors and use them as fuel to work harder for his next victory.",
        impact: "Mental Resilience"
    },
    {
        name: "Harimadhav T.A",
        parents: "Smitha",
        image: "/ach6.jpeg",
        tag: "Behavioral Change",
        quote: "Chess helped him manage his hyperactive nature and concentration.",
        description: "Since joining the academy, Harimadhav has shown visible behavioral improvements. His increased ability to focus has translated directly into better academic results in school.",
        impact: "Focus Mastery"
    },
    {
        name: "Anvit Ajesh",
        parents: "Lakshmy",
        image: "/ach7.jpeg",
        tag: "Team Player",
        quote: "Sharing skills with others—a true team player at heart.",
        description: "After one year of coaching, Anvit is absorbing skills quickly. He doesn't just learn; he shares his knowledge with peers, boosting both his own confidence and his math problem-solving skills.",
        impact: "Leadership"
    },
    {
        name: "Revant Ajesh",
        parents: "Lakshmy",
        image: "/ach8.jpeg",
        tag: "Logic & Math",
        quote: "Improved concentration helping significantly with math problems.",
        description: "Completing his first year under Coach Praveen, Revant has shown steady improvement. His ability to think several moves ahead in chess is directly benefiting his logical reasoning in school.",
        impact: "Analytical Mind"
    },
    {
        name: "Nachiket S Pai",
        parents: "Sathyan",
        image: "/ach9.jpeg",
        tag: "Early Prodigy",
        quote: "Secured third place in his first tournament within just 2.5 months.",
        description: "Nachiket’s progress is truly admirable. His commitment to identifying and nurturing his natural talent led to a podium finish almost immediately after starting his training.",
        impact: "Rapid Podium"
    },
    {
        name: "Abhivandh O.B",
        parents: "Manju",
        image: "/ach10.jpeg",
        tag: "Study Focus",
        quote: "Valuable tournament experience and better concentration in studies.",
        description: "One year at Royal Rooks has given Abhivandh the experience to compete at higher levels. This discipline has translated into a noticeable boost in his academic concentration.",
        impact: "Tournament Ready"
    },
    {
        name: "Dhruv Jithin",
        parents: "Jithin",
        image: "/ach11.jpeg",
        tag: "Fast Track",
        quote: "Won Second Runner-Up in the academy tournament in record time.",
        description: "Dhruv joined with only the basics but quickly learned complex strategies. His excitement to attend every class is a reflection of the enjoyable and encouraging atmosphere we provide.",
        impact: "Strategic Growth"
    },
    {
        name: "Nived Narayanaswamy",
        parents: "Narayanaswami",
        image: "/ach12.jpeg",
        tag: "Patience Mastery",
        quote: "Significant growth in patience and technical chess skills.",
        description: "Nived’s journey has been defined by his developing patience. The academy's dedication to his progress has been a true game-changer in his evolution as a competitive chess player.",
        impact: "Technical Depth"
    }
];

export default function AchievementsPage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#E76F51]/20 overflow-x-hidden">
            
            {/* 1. HERO SECTION */}
            <section className="relative pt-24 md:pt-40 pb-16 md:pb-24 px-4 text-center">
                <div className="relative z-10 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-[#E76F51] mb-4 block">
                            Royal Rooks Success Gallery
                        </span>
                        <h1 className="text-4xl md:text-8xl font-black text-[#2D2A26] mb-6 leading-[1.1] tracking-tighter">
                            Hall of <span className="italic font-serif text-[#E76F51]">Fame</span>
                        </h1>
                        <p className="text-base md:text-xl text-[#5C5852] max-w-2xl mx-auto leading-relaxed font-medium">
                            Every student is a victory. Every move is a milestone. Discover the 12 stories of our rising stars.
                        </p>
                    </motion.div>
                </div>
            </section>


            {/* 3. INDIVIDUAL STORIES GALLERY (12 SEPARATE BLOCKS) */}
            <section className="py-20 md:py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="space-y-32 md:space-y-56">
                        {ALL_STORIES.map((story, index) => (
                            <div 
                                key={index}
                                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}
                            >
                                {/* IMAGE SIDE */}
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    className="w-full lg:w-1/2 relative"
                                >
                                    <div className="relative aspect-[4/5] md:aspect-square rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl group">
                                        <Image 
                                            src={story.image} 
                                            alt={story.name} 
                                            fill 
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2A26]/90 via-[#2D2A26]/20 to-transparent opacity-70" />
                                        
                                        {/* Name Label Overlay */}
                                        <div className="absolute bottom-10 left-10">
                                            <h3 className="text-white text-3xl font-black mb-1">{story.name.split(' ')[0]}</h3>
                                            <p className="text-[#FFDA44] font-bold text-sm tracking-widest uppercase">Champion Profile</p>
                                        </div>
                                    </div>
                                    
                                    {/* Abstract background shape */}
                                    <div className={`absolute -z-10 w-80 h-80 blur-[120px] opacity-20 rounded-full ${index % 2 === 0 ? '-top-10 -left-10 bg-[#E76F51]' : '-bottom-10 -right-10 bg-[#FFDA44]'}`} />
                                </motion.div>

                                {/* TEXT SIDE */}
                                <motion.div 
                                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    className="w-full lg:w-1/2 space-y-8"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Badge className="bg-[#E76F51] text-white hover:bg-[#E76F51] border-none font-bold px-6 py-1.5 rounded-full text-xs tracking-wider">
                                                {story.tag}
                                            </Badge>
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-black text-[#2D2A26] leading-[1.1] tracking-tight">
                                            {story.name}
                                        </h2>
                                        <div className="flex items-center gap-3 text-[#5C5852]">
                                            <div className="w-8 h-[2px] bg-[#E76F51]" />
                                            {/* Logic: index 0 is Agnee (Parents), others are (Parent) */}
                                            <p className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">
                                                {index === 0 ? "Parents" : "Parent"}: {story.parents}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <Quote className="absolute -top-6 -left-8 w-16 h-16 text-[#E76F51]/10 transition-transform group-hover:rotate-12" />
                                        <p className="text-xl md:text-3xl font-serif italic text-[#2D2A26] leading-relaxed relative z-10">
                                            "{story.quote}"
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <p className="text-[#5C5852] text-base md:text-xl leading-relaxed font-medium">
                                            {story.description}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-2 bg-[#FDFBF7] px-5 py-3 rounded-2xl border border-[#E6E0D4] shadow-sm">
                                                <Star className="w-5 h-5 text-[#FFDA44] fill-[#FFDA44]" />
                                                <span className="text-sm font-black text-[#2D2A26] uppercase tracking-tighter">Impact: {story.impact}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-[#E6E0D4] shadow-sm">
                                                <GraduationCap className="w-5 h-5 text-[#E76F51]" />
                                                <span className="text-sm font-black text-[#2D2A26] uppercase tracking-tighter">Skill Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            
            {/* 2. STATS SECTION */}
            <AchievementsSection />

            {/* 4. FINAL CTA */}
            <section className="relative py-32 bg-[#FDFBF7] text-center overflow-hidden border-t border-[#E6E0D4]">
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFDA44]/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E76F51]/10 rounded-full blur-3xl" />
                </div>
                
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-xl mb-8">
                        <Trophy className="w-10 h-10 text-[#FFDA44]" />
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black text-[#2D2A26] mb-8 tracking-tighter">
                        Join the <br />
                        <span className="text-[#E76F51]">Next Generation.</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-[#5C5852] mb-12 font-medium max-w-2xl mx-auto">
                        We don't just teach moves; we build champions. Your seat at the board is waiting.
                    </p>
                    <Link href="/contact">
                        <button className="h-20 px-16 rounded-full bg-[#2D2A26] text-white text-xl font-black hover:bg-[#E76F51] transition-all transform hover:scale-105 shadow-2xl active:scale-95">
                            Enroll Now
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
}