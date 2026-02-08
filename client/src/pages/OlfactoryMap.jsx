import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const OlfactoryMap = () => {
    const [activeFilter, setActiveFilter] = useState({
        woody: true,
        floral: false,
        oriental: false,
        fresh: true
    });

    return (
        <div className="bg-background-light text-text-main font-display overflow-hidden h-screen flex flex-col">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light px-10 py-3 bg-white z-20 shadow-sm">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-text-main">
                        <div className="size-6 text-primary">
                            <span className="material-symbols-outlined text-2xl">diamond</span>
                        </div>
                        <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em]">Parfum D'Elite</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-9">
                        <Link to="/shop" className="text-text-muted hover:text-primary transition-colors text-sm font-medium leading-normal">Shop</Link>
                        <Link to="/olfactory-map" className="text-text-main text-sm font-medium leading-normal border-b border-primary pb-0.5">Discovery</Link>
                        <Link to="/about" className="text-text-muted hover:text-primary transition-colors text-sm font-medium leading-normal">About</Link>
                        <Link to="/journal" className="text-text-muted hover:text-primary transition-colors text-sm font-medium leading-normal">Journal</Link>
                    </nav>
                </div>
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <div className="hidden lg:flex w-full max-w-xs items-center rounded-lg bg-surface-light border border-border-light px-3 py-2">
                        <span className="material-symbols-outlined text-text-muted">search</span>
                        <input className="w-full bg-transparent border-none text-text-main text-sm placeholder-text-muted focus:ring-0 ml-2" placeholder="Search fragrances..." />
                    </div>
                    <div className="flex gap-4">
                        <Link to="/cart" className="text-text-muted hover:text-primary transition-colors relative">
                            <span className="material-symbols-outlined">shopping_bag</span>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white font-bold">2</span>
                        </Link>
                        <Link to="/profile" className="text-text-muted hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">account_circle</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                <aside className="w-80 border-r border-border-light bg-surface-light flex flex-col z-10 overflow-y-auto">
                    <div className="p-6 border-b border-border-light">
                        <h1 className="text-2xl font-black text-text-main mb-2">Scent Map</h1>
                        <p className="text-text-muted text-sm leading-relaxed">Navigate our constellation of fragrances connected by shared olfactory notes.</p>
                    </div>
                    <div className="flex-1 p-4 space-y-4">
                        <details className="group open:bg-white/50 rounded-lg transition-colors" open>
                            <summary className="flex cursor-pointer items-center justify-between p-3 select-none hover:bg-white/30 rounded-lg transition-colors">
                                <span className="text-text-main font-medium">Olfactory Family</span>
                                <span className="material-symbols-outlined text-text-muted group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div className="px-3 pb-4 space-y-3 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group/item">
                                    <input type="checkbox" checked={activeFilter.woody} onChange={() => setActiveFilter({ ...activeFilter, woody: !activeFilter.woody })} className="h-4 w-4 rounded border-border-light bg-white text-primary focus:ring-offset-0 focus:ring-0 checked:bg-primary checked:border-primary transition-all" />
                                    <span className="text-text-muted group-hover/item:text-text-main text-sm transition-colors">Woody</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group/item">
                                    <input type="checkbox" checked={activeFilter.floral} onChange={() => setActiveFilter({ ...activeFilter, floral: !activeFilter.floral })} className="h-4 w-4 rounded border-border-light bg-white text-primary focus:ring-offset-0 focus:ring-0 checked:bg-primary checked:border-primary transition-all" />
                                    <span className="text-text-muted group-hover/item:text-text-main text-sm transition-colors">Floral</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group/item">
                                    <input type="checkbox" className="h-4 w-4 rounded border-border-light bg-white text-primary focus:ring-offset-0 focus:ring-0 checked:bg-primary checked:border-primary transition-all" />
                                    <span className="text-text-muted group-hover/item:text-text-main text-sm transition-colors">Oriental</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group/item">
                                    <input type="checkbox" checked={activeFilter.fresh} onChange={() => setActiveFilter({ ...activeFilter, fresh: !activeFilter.fresh })} className="h-4 w-4 rounded border-border-light bg-white text-primary focus:ring-offset-0 focus:ring-0 checked:bg-primary checked:border-primary transition-all" />
                                    <span className="text-text-muted group-hover/item:text-text-main text-sm transition-colors">Fresh</span>
                                </label>
                            </div>
                        </details>
                        <div className="h-px bg-border-light mx-3"></div>
                        <details className="group open:bg-white/50 rounded-lg transition-colors">
                            <summary className="flex cursor-pointer items-center justify-between p-3 select-none hover:bg-white/30 rounded-lg transition-colors">
                                <span className="text-text-main font-medium">Intensity</span>
                                <span className="material-symbols-outlined text-text-muted group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div className="px-3 pb-6 pt-2">
                                <div className="relative h-1 bg-border-light rounded-full mb-6 mx-2">
                                    <div className="absolute left-0 top-0 h-full bg-primary/40 w-3/4 rounded-full"></div>
                                    <div className="absolute left-3/4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary border-2 border-white rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform"></div>
                                </div>
                                <div className="flex justify-between text-xs text-text-muted px-1 font-sans">
                                    <span>Light</span>
                                    <span>Moderate</span>
                                    <span className="text-text-main font-medium">Intense</span>
                                </div>
                            </div>
                        </details>
                        <div className="h-px bg-border-light mx-3"></div>
                        <details className="group open:bg-white/50 rounded-lg transition-colors">
                            <summary className="flex cursor-pointer items-center justify-between p-3 select-none hover:bg-white/30 rounded-lg transition-colors">
                                <span className="text-text-main font-medium">Occasion</span>
                                <span className="material-symbols-outlined text-text-muted group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div className="px-3 pb-4 space-y-2 pt-2">
                                <div className="flex flex-wrap gap-2">
                                    <button className="px-3 py-1.5 rounded-full border border-border-light bg-white text-xs text-text-muted hover:border-primary hover:text-primary transition-colors shadow-sm">Daytime</button>
                                    <button className="px-3 py-1.5 rounded-full border border-primary bg-primary/10 text-xs text-primary font-medium transition-colors">Evening</button>
                                    <button className="px-3 py-1.5 rounded-full border border-border-light bg-white text-xs text-text-muted hover:border-primary hover:text-primary transition-colors shadow-sm">Date Night</button>
                                    <button className="px-3 py-1.5 rounded-full border border-border-light bg-white text-xs text-text-muted hover:border-primary hover:text-primary transition-colors shadow-sm">Office</button>
                                </div>
                            </div>
                        </details>
                    </div>
                    <div className="p-6 border-t border-border-light mt-auto bg-surface-light">
                        <button className="w-full py-3 bg-text-main text-white font-bold text-sm uppercase tracking-wider rounded hover:bg-primary transition-colors shadow-md">
                            Reset Filters
                        </button>
                    </div>
                </aside>

                <main className="flex-1 relative bg-background-light overflow-hidden cursor-move">
                    <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: "radial-gradient(#d1ccc0 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }}>
                    </div>
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center transform scale-100 origin-center transition-transform duration-700 ease-out" id="map-container">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <line className="map-line" stroke="#d4af37" strokeOpacity="0.3" strokeWidth="1.5" x1="50%" x2="30%" y1="50%" y2="35%"></line>
                            <line className="map-line" stroke="#d4af37" strokeOpacity="0.3" strokeWidth="1.5" x1="50%" x2="70%" y1="50%" y2="65%"></line>
                            <line className="map-line" stroke="#d4af37" strokeOpacity="0.2" strokeWidth="1" x1="50%" x2="65%" y1="50%" y2="30%"></line>
                            <line className="map-line" stroke="#d4af37" strokeOpacity="0.2" strokeWidth="1" x1="30%" x2="20%" y1="35%" y2="60%"></line>
                            <line className="map-line" stroke="#d4af37" strokeOpacity="0.2" strokeWidth="1" x1="70%" x2="80%" y1="65%" y2="40%"></line>
                        </svg>

                        {/* Central Node */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group z-10">
                            <div className="relative flex items-center justify-center">
                                <div className="w-5 h-5 bg-primary rounded-full scent-node relative z-10 cursor-pointer group-hover:scale-125 transition-transform duration-300 ring-4 ring-white shadow-lg"></div>
                                <div className="absolute w-12 h-12 bg-primary/20 rounded-full animate-ping opacity-75"></div>
                            </div>
                            <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-100 transition-opacity">
                                <span className="text-text-main text-xs font-serif font-bold tracking-widest uppercase bg-white/80 px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm border border-border-light">Santal Noir</span>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-white border border-border-light rounded-lg shadow-2xl p-0 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto overflow-hidden">
                                <div className="relative h-32 bg-[#f4f4f4]">
                                    <img alt="Luxury amber perfume bottle on light background" className="w-full h-full object-cover mix-blend-multiply opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOQr_pKNkjlOoe7OJLe1-UUcPHUtGfkMH6AM5fuUXCKxpitCEh__jUKtnG3npIr9NeULNs1Ljy09X25rfpQzeU2D55DMhi7wKjI5v7n6pN7lgWv7RK9GiwE2YLVwGbp0o11mC1WUmCCyxxftKqFdYKz_ODbZ-FTXyttRA5z0d1PpSnyfpvICtYyiEdlck0hYXk8dOz5-X8OnDXpy9gMtatSwVINYUrzbhjBNTfB_zBhlUHF_hKN3U47-ARIPW-9KbldLgMCBYS2z8" />
                                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-primary border border-primary/20 font-bold uppercase tracking-wide">Woody</div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-text-main font-display">Santal Noir</h3>
                                    <p className="text-text-muted text-xs mt-1 font-sans">Sandalwood, Cardamom, Leather</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-primary font-bold text-sm">$280</span>
                                        <button className="bg-text-main text-white hover:bg-primary transition-colors text-xs px-3 py-1.5 rounded font-medium shadow-md">Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Node 2 */}
                        <div className="absolute top-[35%] left-[30%] -translate-x-1/2 -translate-y-1/2 group z-10">
                            <div className="w-3 h-3 bg-white border-2 border-primary rounded-full relative z-10 cursor-pointer group-hover:scale-125 group-hover:bg-primary transition-all duration-300 shadow-md"></div>
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">
                                <span className="text-text-main text-[10px] font-serif tracking-widest uppercase font-bold group-hover:bg-white/80 group-hover:px-1.5 group-hover:py-0.5 group-hover:rounded-full group-hover:shadow-sm">Oud Impérial</span>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-white border border-border-light rounded shadow-lg text-xs text-text-main opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 font-medium">
                                Oud • Incense • Patchouli
                            </div>
                        </div>

                        {/* Node 3 */}
                        <div className="absolute top-[65%] left-[70%] -translate-x-1/2 -translate-y-1/2 group z-10">
                            <div className="w-3 h-3 bg-white border-2 border-primary rounded-full relative z-10 cursor-pointer group-hover:scale-125 group-hover:bg-primary transition-all duration-300 shadow-md"></div>
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-60 group-hover:opacity-100 transition-opacity">
                                <span className="text-text-main text-[10px] font-serif tracking-widest uppercase font-bold group-hover:bg-white/80 group-hover:px-1.5 group-hover:py-0.5 group-hover:rounded-full group-hover:shadow-sm">Rose Velours</span>
                            </div>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-white border border-border-light rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-20 flex gap-3 items-center">
                                <div className="w-12 h-12 shrink-0 bg-[#f4f4f4] rounded overflow-hidden border border-border-light">
                                    <img alt="Pink perfume bottle detail" className="w-full h-full object-cover mix-blend-multiply" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkAshjEPIZ0B5BAWzfzENUw5lGbAvHWWkZ8YXqXNhIt11PcRg_TyM_kWWvfWenAk3YfVvAt2xm_CTyigGnkTGUzbICg4N7IyDt1PpoFox58FitGdtGzSQghVCTD3efiKUfCH8UzKszQRYVMIfd2A0aHnxAlQIPFP2eQX27SqYtCGNIU89N8WDHLQnvJypq6O0aSOgmoYSDH0w2JSPupeZIVCQ1WI30grs78-SvbbBgIUi78QzIOuC207LzWqoYR12B3xZZCm8UakI" />
                                </div>
                                <div>
                                    <div className="text-text-main font-bold text-sm font-display">Rose Velours</div>
                                    <div className="text-primary font-bold text-xs mt-0.5">$210</div>
                                </div>
                            </div>
                        </div>

                        {/* Other Nodes */}
                        <div className="absolute top-[30%] left-[65%] -translate-x-1/2 -translate-y-1/2 group z-10">
                            <div className="w-2 h-2 bg-text-muted/40 rounded-full relative z-10 cursor-pointer hover:bg-primary transition-colors duration-300 ring-2 ring-transparent hover:ring-white hover:shadow-md"></div>
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-40 group-hover:opacity-100 transition-opacity">
                                <span className="text-text-muted text-[9px] font-serif tracking-widest uppercase group-hover:text-text-main group-hover:font-bold">Jasmin d'Eté</span>
                            </div>
                        </div>
                        <div className="absolute top-[60%] left-[20%] -translate-x-1/2 -translate-y-1/2 group z-10">
                            <div className="w-2 h-2 bg-text-muted/40 rounded-full relative z-10 cursor-pointer hover:bg-primary transition-colors duration-300 ring-2 ring-transparent hover:ring-white hover:shadow-md"></div>
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-40 group-hover:opacity-100 transition-opacity">
                                <span className="text-text-muted text-[9px] font-serif tracking-widest uppercase group-hover:text-text-main group-hover:font-bold">Cuir de Russie</span>
                            </div>
                        </div>
                        <div className="absolute top-[40%] left-[80%] -translate-x-1/2 -translate-y-1/2 group z-10">
                            <div className="w-2.5 h-2.5 bg-white border border-text-muted rounded-full relative z-10 cursor-pointer hover:bg-primary hover:border-primary transition-colors duration-300 shadow-sm"></div>
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-40 group-hover:opacity-100 transition-opacity">
                                <span className="text-text-muted text-[9px] font-serif tracking-widest uppercase group-hover:text-text-main group-hover:font-bold">Ambre Sultan</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20">
                        <button className="bg-white border border-border-light text-text-main p-2 rounded hover:bg-surface-light hover:text-primary transition-colors shadow-lg">
                            <span className="material-symbols-outlined text-xl">add</span>
                        </button>
                        <button className="bg-white border border-border-light text-text-main p-2 rounded hover:bg-surface-light hover:text-primary transition-colors shadow-lg">
                            <span className="material-symbols-outlined text-xl">remove</span>
                        </button>
                        <button className="bg-white border border-border-light text-text-main p-2 rounded hover:bg-surface-light hover:text-primary transition-colors shadow-lg mt-2">
                            <span className="material-symbols-outlined text-xl">my_location</span>
                        </button>
                    </div>

                    <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md border border-border-light rounded-lg p-3 z-20 flex gap-4 text-xs shadow-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm ring-2 ring-white"></div>
                            <span className="text-text-main font-medium">Selected Match</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-primary shadow-sm"></div>
                            <span className="text-text-main">Direct Relation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-text-muted/40"></div>
                            <span className="text-text-muted">Others</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OlfactoryMap;
