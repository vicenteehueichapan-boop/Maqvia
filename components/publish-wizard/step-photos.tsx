import { ImagePlus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { type ChangeEvent, type DragEvent } from "react";
import { type Photo } from "@/lib/image-processing";

export interface StepPhotosProps {
  photos: Photo[];
  processingPhotos: boolean;
  photoError: string;
  touchedImages?: boolean;
  draggedPhoto: number | null;
  setDraggedPhoto: (index: number | null) => void;
  addPhotos: (event: ChangeEvent<HTMLInputElement>) => void;
  dropPhotos: (event: DragEvent<HTMLDivElement>) => void;
  reorderPhoto: (from: number, to: number) => void;
  movePhoto: (index: number, direction: -1 | 1) => void;
  removePhoto: (id: string) => void;
}

export function StepPhotos({
  photos,
  processingPhotos,
  photoError,
  touchedImages,
  draggedPhoto,
  setDraggedPhoto,
  addPhotos,
  dropPhotos,
  reorderPhoto,
  movePhoto,
  removePhoto,
}: StepPhotosProps) {
  return (
    <div
      data-publish-step="2"
      onDragOver={(event) => event.preventDefault()}
      onDrop={dropPhotos}
      className="md:col-span-2 rounded-2xl border border-dashed border-[#687a65] bg-[#243027] p-5 text-sm"
    >
      <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-[#dce9d8]">
        <ImagePlus size={19} className="text-[#b9d88b]" /> Añadir fotos *{" "}
        <span className="font-normal text-[#a5b3a2]">(1 a 4)</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={addPhotos}
          className="sr-only"
        />
      </label>
      <p className="mt-2 text-xs text-[#96a594]">
        JPG, PNG o WebP; máximo 5 MB por foto. La primera es la portada. También puedes soltar fotos
        aquí o arrastrarlas para reordenarlas.
      </p>
      {processingPhotos ? (
        <p role="status" className="mt-3 text-xs text-[#cce2c3]">
          Preparando fotos…
        </p>
      ) : null}
      {photos.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => setDraggedPhoto(index)}
              onDragEnd={() => setDraggedPhoto(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (draggedPhoto !== null) reorderPhoto(draggedPhoto, index);
                setDraggedPhoto(null);
              }}
              className="rounded-xl border border-[#52634e] bg-[#18221a] p-2"
            >
              <img
                src={photo.dataUrl}
                alt={"Foto " + (index + 1)}
                className="h-24 w-full rounded-lg object-cover"
              />
              <p className="mt-2 truncate text-xs text-[#d2dfca]">
                {index === 0 ? "Portada" : "Foto " + (index + 1)}
              </p>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => reorderPhoto(index, 0)}
                  className="mt-1 text-xs font-bold text-[#c7e1ad] hover:underline"
                >
                  Usar como portada
                </button>
              )}
              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  aria-label={"Mover foto " + (index + 1) + " antes"}
                  disabled={index === 0}
                  onClick={() => movePhoto(index, -1)}
                  className="rounded-md border border-[#667964] p-1 disabled:opacity-35"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label={"Mover foto " + (index + 1) + " después"}
                  disabled={index === photos.length - 1}
                  onClick={() => movePhoto(index, 1)}
                  className="rounded-md border border-[#667964] p-1 disabled:opacity-35"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  aria-label={"Quitar foto " + (index + 1)}
                  onClick={() => removePhoto(photo.id)}
                  className="ml-auto rounded-md border border-[#667964] p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {photoError || (touchedImages && !photos.length) ? (
        <p role="alert" className="mt-3 text-xs text-[#f1b4a4]">
          {photoError || "Añade al menos una foto."}
        </p>
      ) : null}
    </div>
  );
}
