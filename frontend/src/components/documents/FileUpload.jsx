"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiCheck, FiLoader } from "react-icons/fi";
import { api } from "@/lib/api";

export default function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setUploadSuccess(false);
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        await api.uploadDocument(formData);
        window.dispatchEvent(new Event("documents-updated"));
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    setUploading(false);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-8 group ${
        isDragActive ? "scale-[1.02]" : ""
      }`}
      style={{
        borderColor: isDragActive ? 'var(--accent)' : uploadSuccess ? '#10b981' : 'var(--border-primary)',
        background: isDragActive ? 'var(--accent-muted)' : 'var(--bg-surface)',
      }}
    >
      <input {...getInputProps()} />
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
      
      <div className="relative z-10">
        {uploading ? (
          <FiLoader className="mx-auto text-4xl mb-3 animate-spin" style={{ color: 'var(--accent)' }} />
        ) : uploadSuccess ? (
          <div className="animate-fade-in-scale">
            <FiCheck className="mx-auto text-4xl text-emerald-500 mb-3" />
          </div>
        ) : (
          <div className="w-16 h-16 mx-auto rounded-2xl border flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300" style={{ background: 'var(--accent-muted)', borderColor: 'var(--border-primary)' }}>
            <FiUploadCloud className="text-2xl" style={{ color: 'var(--accent)' }} />
          </div>
        )}
        
        <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          {isDragActive
            ? "Drop your files here"
            : uploading
            ? "Processing documents..."
            : uploadSuccess
            ? "Upload complete!"
            : "Drop files to add to knowledge base"}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {!uploading && !uploadSuccess && "or click to browse your computer"}
        </p>
        
        {!uploading && !uploadSuccess && (
          <div className="flex justify-center gap-2 mt-4">
            {["PDF", "DOCX", "TXT", "MD"].map((ext) => (
              <span key={ext} className="px-2 py-0.5 text-[10px] font-medium rounded-md border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)', color: 'var(--text-muted)' }}>
                .{ext.toLowerCase()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
