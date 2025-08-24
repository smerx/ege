import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { X, Upload } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface Assignment {
  id: string;
  title: string;
  description: string;
  max_score: number;
  image_urls: string[];
  created_at: string;
  created_by: string;
}

interface EditAssignmentModalProps {
  assignment: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: Assignment, newImages: File[]) => Promise<void>;
}

export function EditAssignmentModal({
  assignment,
  isOpen,
  onClose,
  onSave,
}: EditAssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxScoreInput, setMaxScoreInput] = useState<string>("100");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title);
      setDescription(assignment.description);
      setMaxScoreInput(
        assignment.max_score === 0 ? "" : String(assignment.max_score)
      );
      setExistingImages(assignment.image_urls || []);
      setNewImages([]);
    }
  }, [assignment]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...files]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!assignment || !title.trim()) return;

    const parsedMaxScore =
      maxScoreInput.trim() === "" ? 0 : parseInt(maxScoreInput, 10) || 0;

    const updatedAssignment: Assignment = {
      ...assignment,
      title: title.trim(),
      description: description.trim(),
      max_score: parsedMaxScore,
      image_urls: existingImages,
    };

    await onSave(updatedAssignment, newImages);
    onClose();
  };

  const handleClose = () => {
    setNewImages([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать задание</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label
              htmlFor="edit-title"
              className="text-sm font-medium mb-2 block"
            >
              Название задания *
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название задания"
            />
          </div>

          <div>
            <Label
              htmlFor="edit-description"
              className="text-sm font-medium mb-2 block"
            >
              Описание
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание задания"
              rows={4}
            />
          </div>

          <div>
            <Label
              htmlFor="edit-max-score"
              className="text-sm font-medium mb-2 block"
            >
              Максимальный балл
            </Label>
            <Input
              id="edit-max-score"
              type="text"
              value={maxScoreInput}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "");
                const normalized = digitsOnly.replace(/^0+(?=\d)/, "");
                setMaxScoreInput(normalized);
              }}
              placeholder="Напр. 100"
            />
          </div>

          {/* Существующие изображения */}
          {existingImages.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Текущие изображения
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative">
                    <ImageWithFallback
                      src={url}
                      alt={`Изображение ${index + 1}`}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-6 h-6 p-0"
                      onClick={() => removeExistingImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Новые изображения */}
          <div>
            <Label
              htmlFor="edit-images"
              className="text-sm font-medium mb-3 block"
            >
              Добавить новые изображения
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="edit-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("edit-images")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Выбрать
              </Button>
            </div>

            {newImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {newImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Новое изображение ${index + 1}`}
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-6 h-6 p-0"
                      onClick={() => removeNewImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              Сохранить изменения
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
