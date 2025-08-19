import { formatBytes } from 'lib/util';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0] || null;
    setFile(selectedFile); // ✅ update local state
    onFileSelect?.(selectedFile);
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] }, // ✅ correct MIME
    maxSize: 20 * 1024 * 1024,
  });

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="space-y-4 cursor-pointer">
          <div className="mx-auto flex flex-col items-center justify-center">
           

            {file ? (
              <div className='uploader-selected-file mt-3 w-full' onClick={(e)=> e.stopPropagation()}>
                <div className="flex items-center space-x-5">
                  <img src="/images/pdf.png" alt="pdf" className='size-10' />               
                </div>
                
                  <div className='flex items-center flex-col'>
                    <p className="text-sm text-gray-500">
                      {file.name}
                    </p>

                    <span className='text-sm text-gray-500 font-semibold'>
                       ({formatBytes(file.size)})
                    </span>
                  </div>

                  <button className='p-2 cursor-pointer'
                   onClick={(e)=> onFileSelect?.(null)}
                  >
                    <img src="/icons/cross.svg" alt="close" className='w-4 h-4' />

                  </button>
              </div>


            ) : (
              <div className='flex flex-col items-center'>
                 <img
              src="icons/info.svg"
              alt="upload"
              className="size-14"
            />
                <p className="text-base text-gray-500 py-2">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500 text-center">
                  PDF (max 20 MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
