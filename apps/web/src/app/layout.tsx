import MainLayout from "@/components/MainLayout";
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
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
