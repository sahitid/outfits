import "./globals.css";
export const metadata = {
  title: "Form — Your closet, your kind of cute",
  description:
    "A personal virtual closet with campus-ready outfits, aesthetic moodboards, live weather and AI clothing recognition.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
