import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { X, Upload } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface TheoryBlock {
  id: string;
  title: string;
  content: string;
  image_urls: string[];
  created_at: string;
  created_by: string;
}

interface EditTheoryModalProps {
  theory: TheoryBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (theory: TheoryBlock, newImages: File[]) => Promise<void>;
}

export function EditTheoryModal({ theory, isOpen, onClose, onSave }: EditTheoryModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (theory) {
      setTitle(theory.title);
      setContent(theory.content);
      setExistingImages(theory.image_urls || []);
      setNewImages([]);
    }
  }, [theory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!theory || !title.trim()) return;

    const updatedTheory: TheoryBlock = {
      ...theory,
      title: title.trim(),
      content: content.trim(),
      image_urls: existingImages
    };

    await onSave(updatedTheory, newImages);
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
          <DialogTitle>Редактировать теорию</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="edit-theory-title" className="text-sm font-medium mb-2 block">Название *</Label>
            <Input
              id="edit-theory-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название теории"
            />
          </div>

          <div>
            <Label htmlFor="edit-theory-content" className="text-sm font-medium mb-2 block">Содержание</Label>
            <Textarea
              id="edit-theory-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Содержание теоретического материала"
              rows={6}
            />
          </div>

          {/* Существующие изображения */}
          {existingImages.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">Текущие изображения</Label>
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
            <Label htmlFor="edit-theory-images" className="text-sm font-medium mb-3 block">Добавить новые изображения</Label>
            <div className="flex items-center gap-4">
              <Input
                id="edit-theory-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              <Button variant="outline" onClick={() => document.getElementById('edit-theory-images')?.click()}>
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
