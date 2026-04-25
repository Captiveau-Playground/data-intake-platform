import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata = {
  title: "Football Intel - Data Intake Platform",
  description: "Admin dashboard for football social analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
