"use client";

import React, { useState } from "react";
import { BsStack } from "react-icons/bs";
import { Alert, Button, Input } from "antd";
import { HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../lib/firebase-config";
import { useRouter } from "next/navigation";

const AdminAuthPage = () => {
  const [enteredEmail, setEnteredEmail] = useState<string>("");
  const [enteredPassword, setEnteredPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!enteredEmail || !enteredPassword) {
      setError("Please fill all the fields");
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        enteredEmail,
        enteredPassword
      ).then(async (res) => {
        fetch("/api/auth/admin", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await res.user.getIdToken()}`,
          },
        }).then(async (res) => {
          if (res.ok) {
            router.push("/admin");
            setIsLoading(false);
          } else {
            setError("Invalid Credentials");
            setIsLoading(false);
          }
        });
      });
    } catch (error: any) {
      setError("Invalid Credentials");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-w-screen min-h-screen flex flex-col items-center justify-center">
        <div className="w-11/12 max-w-md flex flex-col items-center justify-center text-center bg-white rounded-xl border border-solid border-gray-200 p-4">
          <h4 className="font-poppins flex flex-row  my-4 font-semibold  text-[22px] text-gray-700 mt-3">
            <BsStack className="w-8 h-8 text-primary pr-2" /> Edustack
          </h4>
          <h5 className="font-semibold my-4 ">Login as Administrator</h5>

          <p className="w-full text-sm text-left pl-2 font-semibold mt-4">
            Email
          </p>
          <Input
            size="large"
            placeholder="Enter Email"
            onChange={(event) => setEnteredEmail(event.target.value)}
            value={enteredEmail || undefined}
            prefix={<HiOutlineMail />}
            className="mb-6"
          />

          <p className="w-full text-sm text-left pl-2 font-semibold">
            Password
          </p>
          <Input.Password
            placeholder="Enter Password"
            onChange={(event) => setEnteredPassword(event.target.value)}
            value={enteredPassword || undefined}
            size="large"
            prefix={<HiOutlineLockClosed />}
            className="mb-6"
          />

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="w-full mb-3 text-left"
            />
          )}

          <div className="w-full text-left text-sm mb-2 text-blue-600 pl-2">
            <Link href="auth/forgot-password">Forgot Password?</Link>
          </div>

          <Button
            type="primary"
            className="w-full mb-8 mt-1 h-12 p-12 rounded-xl"
            onClick={handleLogin}
          >
            {isLoading ? "Loading..." : "Login"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminAuthPage;
