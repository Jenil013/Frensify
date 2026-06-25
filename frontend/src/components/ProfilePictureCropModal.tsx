import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import {
  PROFILE_PICTURE_CROP_VIEWPORT,
  type ProfilePictureContentType,
  type ProfilePictureCrop,
  clampCropPosition,
  exportCroppedProfilePicture,
  getCoverScale,
  profilePictureContentType,
} from "../utils/profilePicture";

interface ProfilePictureCropModalProps {
  open: boolean;
  imageSrc: string | null;
  file: File | null;
  onClose: () => void;
  onConfirm: (blob: Blob, contentType: ProfilePictureContentType) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export default function ProfilePictureCropModal({
  open,
  imageSrc,
  file,
  onClose,
  onConfirm,
}: ProfilePictureCropModalProps) {
  const [mediaSize, setMediaSize] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState<ProfilePictureCrop>({ x: 0, y: 0, zoom: 1 });
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, cropX: 0, cropY: 0 });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || !imageSrc) return;
    setCrop({ x: 0, y: 0, zoom: 1 });
    setMediaSize({ width: 0, height: 0 });
  }, [open, imageSrc]);

  const updateCrop = useCallback(
    (next: ProfilePictureCrop) => {
      if (mediaSize.width === 0 || mediaSize.height === 0) {
        setCrop(next);
        return;
      }
      setCrop(clampCropPosition(mediaSize.width, mediaSize.height, next));
    },
    [mediaSize.height, mediaSize.width]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (mediaSize.width === 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      cropX: crop.x,
      cropY: crop.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || mediaSize.width === 0) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    setCrop((prev) =>
      clampCropPosition(mediaSize.width, mediaSize.height, {
        ...prev,
        x: dragStart.current.cropX + dx,
        y: dragStart.current.cropY + dy,
      })
    );
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleZoomChange = (zoom: number) => {
    updateCrop({ ...crop, zoom });
  };

  const handleConfirm = async () => {
    if (!imageSrc || !file || mediaSize.width === 0) return;
    setSaving(true);
    try {
      const contentType = profilePictureContentType(file);
      const blob = await exportCroppedProfilePicture(imageSrc, crop, contentType);
      onConfirm(blob, contentType);
    } finally {
      setSaving(false);
    }
  };

  if (!open || !imageSrc || !file) return null;

  const scale =
    mediaSize.width > 0
      ? getCoverScale(
          mediaSize.width,
          mediaSize.height,
          PROFILE_PICTURE_CROP_VIEWPORT,
          crop.zoom
        )
      : 1;
  const displayWidth = mediaSize.width * scale;
  const displayHeight = mediaSize.height * scale;
  const imageLeft = (PROFILE_PICTURE_CROP_VIEWPORT - displayWidth) / 2 + crop.x;
  const imageTop = (PROFILE_PICTURE_CROP_VIEWPORT - displayHeight) / 2 + crop.y;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-picture-crop-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#37352F]/30 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E9E9E7] flex flex-col animate-fade-in">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#E9E9E7]">
          <div>
            <h2
              id="profile-picture-crop-title"
              className="text-base font-bold text-[#37352F] tracking-tight"
            >
              Adjust your photo
            </h2>
            <p className="text-xs text-[#7A7A78] mt-0.5">
              Drag to reposition · zoom to fine-tune what appears in the frame
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7A78] hover:bg-[#F1F1EF] hover:text-[#37352F] transition-colors shrink-0 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div
            className="relative mx-auto rounded-2xl overflow-hidden bg-[#F1F1EF] touch-none select-none cursor-grab active:cursor-grabbing"
            style={{
              width: PROFILE_PICTURE_CROP_VIEWPORT,
              height: PROFILE_PICTURE_CROP_VIEWPORT,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img
              src={imageSrc}
              alt=""
              draggable={false}
              className="absolute max-w-none pointer-events-none"
              style={{
                width: displayWidth || "auto",
                height: displayHeight || "auto",
                left: imageLeft,
                top: imageTop,
                opacity: mediaSize.width > 0 ? 1 : 0,
              }}
              onLoad={(event) => {
                const img = event.currentTarget;
                const width = img.naturalWidth;
                const height = img.naturalHeight;
                setMediaSize({ width, height });
                setCrop(clampCropPosition(width, height, { x: 0, y: 0, zoom: 1 }));
              }}
            />

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: "0 0 0 9999px rgba(55, 53, 47, 0.45)",
                borderRadius: "9999px",
              }}
            />
            <div className="absolute inset-0 pointer-events-none rounded-full border-2 border-white/90" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#7A7A78]">
              <ZoomIn className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Zoom
              </span>
            </div>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={crop.zoom}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              className="w-full accent-[#2D6A53] cursor-pointer"
              aria-label="Zoom photo"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E9E9E7] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 border border-[#E9E9E7] text-[#5F5E5B] hover:bg-[#FAFAF9] text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={saving || mediaSize.width === 0}
            className="px-5 py-2.5 bg-[#2D6A53] hover:bg-[#204E3C] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? "Saving…" : "Use photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
