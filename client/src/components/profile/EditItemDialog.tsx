import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditItemDialogProps {
  showItemDialog: boolean;
  setShowItemDialog: (show: boolean) => void;
  itemType: "achievement" | "project" | "client" | "teamMember" | "insight" | null;
  currentItem: any;
  itemForm: any;
  handleItemInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleItemSelectChange: (name: string, value: string) => void;
  handleTagsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveItem: () => void;
}

const EditItemDialog = ({
  showItemDialog,
  setShowItemDialog,
  itemType,
  currentItem,
  itemForm,
  handleItemInputChange,
  handleItemSelectChange,
  handleTagsChange,
  handleSaveItem
}: EditItemDialogProps) => (
  <Dialog open={showItemDialog} onOpenChange={(open) => !open && setShowItemDialog(false)}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {currentItem ? `Edit ${itemType}` : `Add New ${itemType}`}
        </DialogTitle>
        <DialogDescription>
          {currentItem 
            ? `Make changes to this ${itemType} below.` 
            : `Enter the details for the new ${itemType} below.`}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {itemType === "client" ? (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              name="name"
              value={itemForm.name || ""}
              onChange={handleItemInputChange}
              className="col-span-3"
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                name="title"
                value={itemForm.title || ""}
                onChange={handleItemInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={itemForm.description || ""}
                onChange={handleItemInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </>
        )}

        {/* Fields specific to different item types */}
        {itemType === "achievement" && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">Icon</Label>
            <Select
              value={itemForm.icon || "award"}
              onValueChange={(value) => handleItemSelectChange("icon", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="award">Award</SelectItem>
                <SelectItem value="trophy">Trophy</SelectItem>
                <SelectItem value="chart">Chart</SelectItem>
                <SelectItem value="medal">Medal</SelectItem>
                <SelectItem value="star">Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {itemType === "project" && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">Tags</Label>
            <Input
              id="tags"
              name="tags"
              value={itemForm.tags ? itemForm.tags.join(", ") : ""}
              onChange={handleTagsChange}
              placeholder="Comma-separated tags"
              className="col-span-3"
            />
          </div>
        )}

        {itemType === "teamMember" && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                name="name"
                value={itemForm.name || ""}
                onChange={handleItemInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Input
                id="role"
                name="role"
                value={itemForm.role || ""}
                onChange={handleItemInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={itemForm.imageUrl || ""}
                onChange={handleItemInputChange}
                className="col-span-3"
              />
            </div>
          </>
        )}

        {itemType === "insight" && (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="linkText" className="text-right">Link Text</Label>
            <Input
              id="linkText"
              name="linkText"
              value={itemForm.linkText || ""}
              onChange={handleItemInputChange}
              className="col-span-3"
            />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setShowItemDialog(false)}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSaveItem}>
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default EditItemDialog;