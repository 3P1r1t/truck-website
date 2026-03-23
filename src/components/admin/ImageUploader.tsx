"use client";

import { useState } from "react";
import { uploadProductImage } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function ImageUploader({
  productId,
  onUploaded,
}: {
  productId: string;
  onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      await uploadProductImage(productId, file, "detail");
      onUploaded();
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={onChange} disabled={uploading} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
    </div>
  );
}
