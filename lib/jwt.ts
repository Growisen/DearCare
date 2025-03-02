
'use server'
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);

// Encrypt the payload into a JWT token (valid for 1 day)
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d") // Token expires after 1 day
    .sign(key);
}

// Decrypt and verify the JWT token
export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

// Create a session for the user
export async function login(formData: FormData) {
  // Verify credentials && get the user

  const user = { email: formData.get("email"), name: "John" };

  // Set expiration time for 1 day
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user, expires });
   
  // Save the session in a cookie (valid for 1 day)
  (await
    
        // Save the session in a cookie (valid for 1 day)
        cookies()).set("session", session, { expires, httpOnly: true });

}

// Destroy the session (logout)
export async function logout() {
    console.log("success");
  (await cookies()).set("session", "", { expires: new Date(0) });
  
}

// Retrieve and decrypt the session
export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}