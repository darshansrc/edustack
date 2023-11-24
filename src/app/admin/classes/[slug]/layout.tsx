import ClassSidebar from "./components/ClassSidebar";

export default function ClassDashboardLayout({
  params,
  children,
}: {
  params: { slug: string };
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="flex flex-row min-w-full max-w-full">
        <ClassSidebar params={params} />
        <section className="w-full">{children}</section>
      </nav>
    </>
  );
}
