import AdminSidebar from "./components/sidebar/AdminSidebar";

export default function AdminDashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="flex flex-row min-w-[100vw]">
        <AdminSidebar />
        <section className="w-full">{children}</section>
      </nav>
    </>
  );
}
