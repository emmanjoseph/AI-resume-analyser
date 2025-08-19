import { useNavigate, useParams } from 'react-router'
import type { Route } from './+types/home';
import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { usePuterStore } from 'lib/puter';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind | Review" },
    { name: "description", content: "Get smart feedback for your dream job" },
  ];
}

const Resume = () => {
    const {auth,isLoading,fs,kv} = usePuterStore()
    const {id} = useParams();
    const [imageUrl,setImageUrl] = useState('');
    const [resumeUrl,setResumeUrl] = useState('');
    const [feedback,setFeedback] = useState('');
    const navigate = useNavigate();


    useEffect(()=> {
        const loadResume = async ()=>{
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;
            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], {type:"application/pdf"});
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if (!imageBlob) return;

            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);
            setFeedback(data.feedback);


        }

        loadResume();
    },[id]);

      useEffect(() => {
    if (!auth.isAuthenticated) {
        navigate(`/auth?next=/resume/${id}`);
    }
}, [auth.isAuthenticated, navigate]);

  return (
    <main className='!pt-0'>
        <nav className='resume-nav'>
            <Link to={"/"} className='back-button'>
              <img src="/icons/back.svg" alt="logo" className='w-2.5 h-2.5' />
              <span className='text-gray-600 text-sm font-semibold'>Back to homepage</span>
            </Link>
        </nav>

        <div className="flex flex-row w-full max-lg:flex-col-reverse">
            <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                {imageUrl && resumeUrl && (
                    <div className='animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-w-xl:h-fit w-fit'>
                        <a href={resumeUrl} target='_blank' rel="noopener noreferrer" >
                          <img 
                              src={imageUrl}
                              alt="image"
                              className='w-full h-full object-contain rounded-2xl' 
                            />

                        </a>

                    </div>
                )}

            </section>

            <section className='feedback-section'>
                <h2 className='font-bold'>Resume Review</h2>

                {
                    feedback ? (
                        <div className='flex flex-col animate-in fade-in duration-1000'>
                            <span>Summary ATS Details</span>


                        </div>
                    ):(
                        <div>
                            <img src="/images/resume-scan-2.gif" alt="" className='w-full' />
                        </div>
                    )
                }
            </section>
        </div>
    </main>
  )
}

export default Resume