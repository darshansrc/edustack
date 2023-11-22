import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link
        href="/auth/admin"
        className="text-blue-600 underline min-w-screen min-h-screen flex flex-col justify-center items-center"
      >
        Login as Admin
      </Link>
    </>
  );
}
