import { usePuterStore } from 'lib/puter'
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router';

export const meta = ()=> ([
    { title:"Resumind | Auth" },
    { name:"description", content:"Log into your account"}
])

const Auth = () => {
    const {isLoading, auth} = usePuterStore();
    const location = useLocation()
    const next = location.search.split("next=")[1];
    const navigate = useNavigate()

  useEffect(() => {
    if (auth.isAuthenticated && next && next !== location.pathname) {
        navigate(next);
    }
}, [auth.isAuthenticated, next, navigate, location.pathname]);


  return (
    <main
      className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center"
    >
        <div className="gradient-border shadow-lg">
            <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1>Welcome</h1>
                    <span className='text-base'>Log In to Continue Your Job Journey</span>
                </div>

                <div>
                    {isLoading ? (
                        <button className="auth-button animate-pulse">
                            <p className='text-sm'>Signing you in ....</p>
                        </button>
                    ):(
                        <>
                          {auth.isAuthenticated ? (
                            <button className="auth-button" onClick={auth.signOut}>
                            <p className='text-sm'>Log out</p>
                               
                            </button>
                          ):(
                             <button className="auth-button" onClick={auth.signIn}>
                            <p className='text-sm'>Log in</p>
                               
                            </button>
                          )}
                        </>
                    )}
                </div>
            </section>
        </div>
    </main>
  )
}

export default Auth
