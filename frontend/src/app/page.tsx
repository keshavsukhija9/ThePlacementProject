import Onboarding from "@/components/Onboarding";

export default function Home() {
  return (
    <main className="min-h-screen relative flex items-center justify-center">
      {/* Top Nav Mock */}
      <div className="absolute top-0 left-0 w-full p-4 border-b border-border flex items-center justify-between">
        <div className="font-medium text-primary text-h2 ml-4">ThePlacementProject.</div>
      </div>
      <Onboarding />
    </main>
  );
}
