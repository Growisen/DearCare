import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/app/actions/authentication/auth";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Authentication error:", error.message);
    redirect("/signin");
  }
  
  if (!session) {
    redirect("/signin");
  }
  
  redirect("/dashboard");
  
  return null;
}
