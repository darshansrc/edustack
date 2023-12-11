import { customInitApp } from "@/lib/firebase-admin-config";
import { db } from "@/lib/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { NextRequest } from "next/server";

customInitApp();

export async function GET(request: NextRequest) {
  console.log("Hello world!");
  const notification = new Date().toLocaleString().trim();
  await setDoc(doc(db, "notifications", "niger"), {
    time: notification,
  });

  return new Response("Hello world!");
}
