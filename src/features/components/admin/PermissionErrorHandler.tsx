"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function PermissionErrorHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");

    if (error === "insufficient_permissions") {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You don't have permission to access this page.",
        confirmButtonColor: "#f97316",
      }).then(() => {
        // Clear the error parameter from URL
        const url = new URL(window.location.href);
        url.searchParams.delete("error");
        router.replace(url.pathname);
      });
    }
  }, [searchParams, router]);

  return <>{children}</>;
}
