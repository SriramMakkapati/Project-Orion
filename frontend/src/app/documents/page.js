import MainLayout from "@/components/layout/MainLayout";
import DocumentList from "@/components/documents/DocumentList";
import FileUpload from "@/components/documents/FileUpload";

export default function DocumentsPage() {
  return (
    <MainLayout>
      <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Knowledge Base</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Upload documents to enhance your research with private knowledge.</p>
        </div>
        <FileUpload />
        <DocumentList />
      </div>
    </MainLayout>
  );
}
