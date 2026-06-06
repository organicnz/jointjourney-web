import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#c7d2fe,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,#3730a3,transparent)]"></div>
      </div>

      <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8 py-24 mx-auto z-10 mt-12">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground bg-clip-text">
            Embark on your next <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
              JointJourney
            </span>
          </h1>
          <p className="mx-auto max-w-[700px] text-lg sm:text-xl text-muted-foreground font-medium">
            Connect, collaborate, and achieve your goals together. Our platform empowers you to coordinate seamlessly with your team.
          </p>
        </div>
        <div className="space-x-4">
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 shadow-lg shadow-indigo-500/20")}>
            Get Started for Free
          </Link>
          <Link href="#features" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8")}>
            Learn More
          </Link>
        </div>
      </div>
      
      {/* Decorative glass panels or feature cards could go here */}
      <div className="container mx-auto px-4 md:px-6 pb-24 mt-12" id="features">
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-black/5 dark:border-white/5 shadow-2xl transition-transform hover:-translate-y-1">
               <h3 className="font-semibold text-lg mb-2">Real-time Collaboration</h3>
               <p className="text-muted-foreground text-sm leading-relaxed">Work together with your team in real-time, no matter where you are. Instantly see updates and keep everyone aligned.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-black/5 dark:border-white/5 shadow-2xl transition-transform hover:-translate-y-1">
               <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
               <p className="text-muted-foreground text-sm leading-relaxed">Your data is secured by enterprise-grade encryption and powered by Supabase Auth for complete peace of mind.</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-black/5 dark:border-white/5 shadow-2xl transition-transform hover:-translate-y-1">
               <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
               <p className="text-muted-foreground text-sm leading-relaxed">Built on the Next.js App Router for optimal performance, giving you an instantaneous and smooth user experience.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
