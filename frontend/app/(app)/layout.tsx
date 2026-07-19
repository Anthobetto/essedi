import Navbar from "@/components/Navbar";
import AssistantWidget from "@/components/AssistantWidget";

export const dynamic = 'force-dynamic'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <AssistantWidget />
    </>
  );
}