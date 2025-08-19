import { prepareInstructions } from 'constants/index';
import { convertPdfToImage } from 'lib/pdf2Img';
import { usePuterStore } from 'lib/puter';
import { formatBytes, generateUUID } from 'lib/util';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar';

const Upload = () => {
  const {auth,isLoading,fs,ai,kv} = usePuterStore();
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleAnalyze = async ({companyName,jobTitle,jobDescription,file}:{
    companyName:string;
    jobTitle:string;
    jobDescription:string;
    file:File
  }) => {
      setIsProcessing(true);
    setStatusText("Analyzing your resume...");

    const uploadedFile = await fs.upload([file]);

    if (uploadedFile) await fs.upload([file]);
    if(!uploadedFile) return setStatusText("Error; Failed to upload file");

   setStatusText('converting to image'); 
   const imageFile = await convertPdfToImage(file);
if (!imageFile.file) {
  return setStatusText(`Error: ${imageFile.error ?? "Failed to convert PDF to image"}`);
}


   setStatusText('Uploading the image');

   const uploadImage = await fs.upload([imageFile.file]);
   if(!uploadImage) return setStatusText("Error: Failed to upload image");

   setStatusText("Preparing data.. ");

   const uuid = generateUUID();

   const data = {
      id:uuid,
      resumePath:uploadedFile.path,
      imagePath:uploadImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback:""
      }

      await kv.set(`resume:${uuid}`,JSON.stringify(data));

      setStatusText("Analyzing ...");

      const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({
          jobTitle,jobDescription
        })
      );

      if(!feedback) return setStatusText("Error: Fialed to analyze resume");

      const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;

      data.feedback = JSON.parse(feedbackText);

      await kv.set(`resume:${uuid}`,JSON.stringify(data));

      setStatusText("Analysis complete, redirecting ....");

      console.log(data);
      
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;

    // Ensure file is included in formData
    if (file) {
      formData.append("resume", file);
    }
    // TODO: send formData to backend here
    // fetch("/api/upload", { method: "POST", body: formData })
    if (file) {
      handleAnalyze({ companyName, jobDescription, jobTitle, file });
    }
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover bg-center">
      <Navbar />
      <div className="main-section">
        <div className="page-heading py-10">
          <h1>Smart feedback <br />for your dream job</h1>

          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" alt="processing" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement</h2>
          )}
        </div>
      </div>

      {!isProcessing && (
        <div className="max-w-3xl mx-auto pb-40">
          <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-div">
              <label className='text-gray-600 text-[14px]' htmlFor="company-name">Company name</label>
              <input type="text" className='text-[15px] text-gray-600' name="company-name" id="company-name" placeholder="Microsoft" />
            </div>

            <div className="form-div">
              <label className='text-gray-600 text-[14px]' htmlFor="job-title">Job title</label>
              <input type="text" className='text-[15px] text-gray-600' name="job-title" id="job-title" placeholder="General manager" />
            </div>

            <div className="form-div">
              <label className='text-gray-600 text-[14px]' htmlFor="job-description">Job description</label>
              <textarea
                name="job-description"
                id="job-description"
                placeholder="Write a clear and consise job description with responsibilities & expectations"
                rows={5}
                className='text-[15px] text-gray-600'
              />
            </div>

            <div className="form-div">
              <label className='text-gray-600 text-[14px]' htmlFor="upload-resume">Upload resume</label>
              <FileUploader onFileSelect={handleFileSelect} />
            </div>

            <button type="submit" className="primary-button" disabled={!file}>
              <p className="text-sm">
                Save & Analyze Resume
              </p>
              
            </button>
          </form>
        </div>
      )}
    </main>
  );
};

export default Upload;
