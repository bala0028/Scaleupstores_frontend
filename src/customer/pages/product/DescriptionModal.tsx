import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  description: string;
  onClose: () => void;
}

const DescriptionModal = ({ description, onClose }: Props) => (
  <Dialog open onOpenChange={onClose}>
    <DialogContent className="bg-brand-cream border-[1.5px] border-brand-border max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-brand">Product Description</DialogTitle>
      </DialogHeader>
      <div className="whitespace-pre-line text-base leading-relaxed mt-2.5">{description}</div>
      <div className="flex justify-center mt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default DescriptionModal;
