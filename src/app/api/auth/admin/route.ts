import { auth } from "firebase-admin";
import { customInitApp } from "@/lib/firebase-admin-config";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-config";

customInitApp();

export async function GET(request: NextRequest) {
  let userType: string = "";
  const session = cookies().get("session")?.value || "";

  if (!session) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  const decodedClaims = await auth().verifySessionCookie(session, true);

  if (!decodedClaims) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }

  const userUID = decodedClaims.uid; // Get the user's UID
  const userEmail = decodedClaims.email; // Get the user's email
  const getRef = doc(db, "adminUsers", userUID);
  const userDoc = await getDoc(getRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    userType = userData.type;
  }

  return NextResponse.json(
    { isLogged: true, userUID, userEmail, userType },
    { status: 200 }
  );
}

export async function POST(request: NextRequest, response: NextResponse) {
  const authorization = headers().get("Authorization");
  let userType: string = "";

  if (authorization?.startsWith("Bearer ")) {
    const idToken = authorization.split("Bearer ")[1];
    const decodedToken = await auth().verifyIdToken(idToken);

    if (decodedToken) {
      const userUID = decodedToken.uid;
      const getRef = doc(db, "adminUsers", userUID);
      const userDoc = await getDoc(getRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        userType = userData.type;

        if (userType === "admin") {
          // Generate session cookie
          const expiresIn = 60 * 60 * 24 * 5 * 1000;
          const sessionCookie = await auth().createSessionCookie(idToken, {
            expiresIn,
          });

          const options = {
            name: "session",
            value: sessionCookie,
            maxAge: expiresIn,
            httpOnly: true,
            secure: true,
          };

          // Add the cookie to the browser
          cookies().set(options);

          return NextResponse.json({ userType }, { status: 200 });
        } else {
          // User is not admin, return an error
          return NextResponse.error();
        }
      }
    }
  }

  // Authorization failed, return an error
  return NextResponse.error();
}
