"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, Mail, ChevronRight } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashedDottedGrid from "../../components/DashedDottedGrid";

const LoginPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => setIsClient(true), []);
  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", { email, password, redirect: false });
  };

  if (status === "authenticated") return <p>Redirecting to dashboard...</p>;
  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4 overflow-hidden">
      <DashedDottedGrid className="flow" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 70, damping: 15 }}
        className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-dCblue/10"
      >
        <div className="p-6 space-y-6">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex flex-col items-center space-y-3"
          >
            <Image src="/logo2.png" alt="Logo" width={150} height={50} className="mb-2 object-contain" />
            <h1 className="text-2xl font-bold text-dCblue">Admin Portal</h1>
            <p className="text-dCblack/70 text-center text-sm">Secure Access to Your Dashboard</p>
          </motion.div>

          <form onSubmit={handleSignIn} className="space-y-5">
            {[{ Icon: Mail, type: "email", value: email, setValue: setEmail, placeholder: "Email Address" },
              { Icon: Lock, type: showPassword ? "text" : "password", value: password, setValue: setPassword, placeholder: "Password" },
            ].map(({ Icon, type, value, setValue, placeholder }, i) => (
              <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1, type: "spring" }}>
                <div className="relative group">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-dCblue/70 group-focus-within:text-dCorange transition-colors" />
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full pl-12 pr-3 py-2 rounded-lg border border-dCblue/30 focus:border-dCorange focus:ring-2 focus:ring-dCorange/30 transition duration-300 text-dCblack text-sm"
                  />
                  {placeholder === "Password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dCblue/70 hover:text-dCorange transition-colors text-sm"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-2 bg-dCblue text-white rounded-lg hover:bg-dCorange group transition duration-300 flex items-center justify-center text-sm"
            >
              Sign In
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          <div className="text-center">
            <a href="#" className="text-xs text-dCblue hover:text-dCorange transition">Forgot Password?</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;