import { AppSidebar } from "@/components/app-sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div></div>
      <div className="flex">
        <AppSidebar>{children}</AppSidebar>
      </div>
    </>
  );
}
