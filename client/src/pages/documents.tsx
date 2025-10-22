import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentCard } from "@/components/document-card";
import { DocumentDialog } from "@/components/document-dialog";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument } from "@/hooks/useDocuments";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Documents() {
  const { toast } = useToast();
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: documents = [], isLoading } = useDocuments();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  const handleDocumentDelete = async (id: string) => {
    try {
      await deleteDocument.mutateAsync(id);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleDocumentEdit = (document: any) => {
    setEditingDocument(document);
    setDocumentDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingDocument) {
        await updateDocument.mutateAsync({ id: editingDocument.id, data });
        toast({
          title: "Success",
          description: "Document updated successfully",
        });
      } else {
        await createDocument.mutateAsync(data);
        toast({
          title: "Success",
          description: "Document created successfully",
        });
      }
      setDocumentDialogOpen(false);
      setEditingDocument(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingDocument ? "update" : "create"} document`,
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Documents</h1>
          <p className="text-muted-foreground mt-1">Track important college paperwork</p>
        </div>
        <Button 
          onClick={() => {
            setEditingDocument(undefined);
            setDocumentDialogOpen(true);
          }}
          data-testid="button-create-document"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filteredDocuments.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No documents found</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onEdit={() => handleDocumentEdit(document)}
              onDelete={() => handleDocumentDelete(document.id)}
            />
          ))}
        </div>
      )}

      <DocumentDialog
        open={documentDialogOpen}
        onOpenChange={(open) => {
          setDocumentDialogOpen(open);
          if (!open) setEditingDocument(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingDocument}
      />
    </div>
  );
}
