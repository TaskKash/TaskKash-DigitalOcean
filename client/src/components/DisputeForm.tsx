import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DisputeFormProps {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
}

export default function DisputeForm({ taskId, taskTitle, onClose }: DisputeFormProps) {
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setEvidence([...evidence, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error("يرجى كتابة سبب النزاع");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success("تم تقديم النزاع بنجاح! سيتم مراجعته خلال 24-48 ساعة");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">تقديم نزاع</h3>
      <p className="text-sm text-muted-foreground mb-4">
        المهمة: <span className="font-semibold">{taskTitle}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="reason">سبب النزاع *</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="اشرح بالتفصيل سبب النزاع وما حدث..."
            rows={5}
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label>الأدلة (اختياري)</Label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="evidence-upload"
              />
              <Label
                htmlFor="evidence-upload"
                className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-accent"
              >
                <Upload className="w-4 h-4" />
                <span>رفع صور أو فيديوهات أو ملفات PDF</span>
              </Label>
            </div>

            {evidence.length > 0 && (
              <div className="space-y-2">
                {evidence.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-accent rounded-lg"
                  >
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>نصيحة:</strong> كلما كانت الأدلة أوضح، كلما كان القرار أسرع. يمكنك رفع:
          </p>
          <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 mr-6 list-disc">
            <li>لقطات شاشة توضح إكمال المهمة</li>
            <li>فيديوهات تثبت تنفيذ المهمة</li>
            <li>أي مستندات داعمة أخرى</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "جاري التقديم..." : "تقديم النزاع"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Card>
  );
}
