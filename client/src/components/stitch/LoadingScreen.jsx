import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden">
            <nav className="absolute top-0 w-full p-8 flex justify-between items-center opacity-0 animate-fade-in delay-1000">
                <div className="text-xs tracking-[0.2em] font-body uppercase text-gray-400 dark:text-gray-500">Collection</div>
                <div className="text-xs tracking-[0.2em] font-body uppercase text-gray-400 dark:text-gray-500">Cart (0)</div>
            </nav>
            <main className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto p-6">
                <div className="relative w-32 h-32 mb-8 animate-fade-in">
                    <svg className="w-full h-full text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 100 100">
                        <path d="M35,30 V20 H42 V12 H58 V20 H65 V30 C65,30 75,30 75,50 V88 H25 V50 C25,30 35,30 35,30 Z"></path>
                    </svg>
                    <svg className="absolute top-0 left-0 w-full h-full text-primary-metallic drop-shadow-[0_0_8px_rgba(212,175,55,0.3)] animate-pulse-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 100">
                        <path d="M35,30 V20 H42 V12 H58 V20 H65 V30 C65,30 75,30 75,50 V88 H25 V50 C25,30 35,30 35,30 Z"></path>
                        <rect height="20" opacity="0.6" rx="1" stroke="currentColor" strokeWidth="0.5" width="30" x="35" y="55"></rect>
                        <line stroke="currentColor" strokeWidth="1" x1="50" x2="50" y1="20" y2="30"></line>
                    </svg>
                    <div className="absolute inset-0 overflow-hidden" style={{ maskImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMzUsMzAgVjIwIEg0MiBWMTIgSDU4IFYyMCBINjUgVjMwIEM2NSwzMCA3NSwzMCA3NSw1MCBWODggSDI1IFY1MCBDMjUsMzAgMzUsMzAgMzUsMzAgWiIgZmlsbD0iYmxhY2siLz48L3N2Zz4=')", WebkitMaskImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMzUsMzAgVjIwIEg0MiBWMTIgSDU4IFYyMCBINjUgVjMwIEM2NSwzMCA3NSwzMCA3NSw1MCBWODggSDI1IFY1MCBDMjUsMzAgMzUsMzAgMzUsMzAgWiIgZmlsbD0iYmxhY2siLz48L3N2Zz4=')", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center" }}>
                        <div className="liquid absolute bottom-0 left-0 w-full h-full bg-primary-metallic opacity-20 animate-[fillUp_2.5s_ease-in-out_infinite]"></div>
                    </div>
                </div>
                <h1 className="font-display text-2xl md:text-3xl tracking-widest text-text-light dark:text-text-dark mb-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    PARFUM <span className="text-primary-metallic italic font-serif">D'Elite</span>
                </h1>
                <p className="font-display italic text-sm text-gray-500 dark:text-gray-400 mt-6 mb-4 animate-pulse tracking-wide" style={{ animationDelay: '400ms' }}>
                    Loading your essence...
                </p>
                <div className="w-48 h-[1px] bg-gray-200 dark:bg-gray-800 relative overflow-hidden mt-2 rounded-full">
                    <div className="absolute top-0 left-0 h-full w-full bg-primary-metallic origin-left animate-[progress_2s_ease-in-out_infinite]"></div>
                </div>
            </main>
            <div className="absolute bottom-8 text-[10px] tracking-[0.3em] uppercase text-gray-300 dark:text-gray-600 animate-fade-in" style={{ animationDelay: '800ms' }}>
                EST. 2024 &nbsp; | &nbsp; PARIS &nbsp; | &nbsp; NEW YORK
            </div>
            <div className="absolute inset-0 pointer-events-none z-[-1] opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}>
            </div>
            <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-primary-metallic rounded-full blur-[120px] opacity-10 dark:opacity-5 pointer-events-none"></div>
            <div className="fixed -top-40 -right-40 w-96 h-96 bg-primary-metallic rounded-full blur-[120px] opacity-10 dark:opacity-5 pointer-events-none"></div>
        </div>
    );
};

export default LoadingScreen;
