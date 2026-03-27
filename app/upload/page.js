import { Suspense } from "react";
import UploadClient from "./UploadClient";
function UploadPageInner() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <UploadClient />
    </Suspense>
  );
}


function UploadPageInner() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <UploadPageInner />
    </Suspense>
  );
}


export const dynamic = "force-dynamic";

export default function UploadPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
      <UploadPageInner />
    </Suspense>
  );
}
