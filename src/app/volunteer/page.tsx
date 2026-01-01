"use client";
import DefaultLayouts from "@/features/layouts/DefaultLayouts";
import VolunteerSection from "@/features/components/VolunteerSection";

export default function VolunteerPage() {
  return (
    <DefaultLayouts>
      <div className="pt-20">
        <VolunteerSection />
      </div>
    </DefaultLayouts>
  );
}
