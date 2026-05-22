export function createWebHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="h-full bg-[#fff7ed]">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#fff7ed">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Juice">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
    <title>Juice Dashboard</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Tailwind CSS Pinned CDN -->
    <script src="https://cdn.tailwindcss.com/3.4.17"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                    },
                    colors: {
                        juiceOrange: '#FD5505',
                        juiceLightOrange: '#FE9402',
                        juiceGreen: '#89C51F',
                        juiceCream: '#FCF1D3',
                        juiceDark: '#fff7ed',
                        juiceCard: '#fffdf8',
                        juiceCardHover: '#fff1dc',
                        juiceBorder: '#ead8c5',
                    },
                    boxShadow: {
                        'glow-orange': '0 0 15px -3px rgba(253, 85, 5, 0.2)',
                        'glow-green': '0 0 15px -3px rgba(137, 197, 31, 0.2)',
                        'glow-orange-lg': '0 0 25px -1px rgba(253, 85, 5, 0.35)',
                    }
                }
            }
        }
    </script>
    <style type="text/css">
        /* Fallback and custom scrollbar styles */
        ::-webkit-scrollbar {
            width: 5px;
            height: 5px;
        }
        ::-webkit-scrollbar-track {
            background: #fff7ed;
        }
        ::-webkit-scrollbar-thumb {
            background: #2e2520;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #FD5505;
        }
        .drag-over {
            border-color: #FD5505 !important;
            background-color: rgba(253, 85, 5, 0.04) !important;
        }
        /* Glassmorphism background mesh */
        .mesh-bg {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: -1;
            background-image: 
                linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 247, 237, 0.72) 42%, rgba(252, 241, 211, 0.68) 100%),
                radial-gradient(at 0% 0%, rgba(253, 85, 5, 0.18) 0px, transparent 48%),
                radial-gradient(at 100% 18%, rgba(137, 197, 31, 0.16) 0px, transparent 44%),
                radial-gradient(at 50% 0%, rgba(254, 148, 2, 0.18) 0px, transparent 58%);
            background-attachment: fixed;
        }
        /* Hide scrollbar utility */
        .scrollbar-none::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .safe-bottom-pad {
            padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
        }
        .safe-shell-pad {
            padding-bottom: calc(6.25rem + env(safe-area-inset-bottom));
        }
    </style>
</head>
<body class="h-full text-[#24170f] font-sans selection:bg-juiceOrange/30 selection:text-[#24170f] overflow-hidden flex flex-col bg-juiceDark">
    <div class="mesh-bg"></div>

    <!-- App Shell Container -->
    <div class="flex-1 flex flex-col h-full max-w-md mx-auto w-full md:max-w-7xl md:px-6 relative overflow-hidden safe-shell-pad md:pb-0">
        
        <!-- Top Identity Area -->
        <header class="pt-8 pb-6 px-4 flex flex-col items-center justify-center shrink-0 border-b border-juiceBorder/50 md:border-b-0 md:pt-12 md:pb-8">
            <div class="relative group cursor-pointer" onclick="refreshData()">
                <!-- Large centered logo for mobile-first identity -->
                <img src="/logo.svg" alt="Juice Logo" class="relative h-36 w-36 md:h-44 md:w-44 object-contain hover:scale-105 transition-transform duration-300 drop-shadow-lg">
            </div>
            <h1 class="mt-4 text-3xl md:text-5xl font-display font-black tracking-tight bg-gradient-to-r from-[#24170f] via-[#FD5505] to-[#89C51F] bg-clip-text text-transparent drop-shadow-sm">
                JUICE
            </h1>
            <p class="text-xs md:text-sm text-[#7c5f4a] font-bold tracking-widest uppercase mt-1.5">Negative avoidance constraints</p>
        </header>

        <!-- Sticky Controls Strip -->
        <section class="px-4 py-2.5 bg-white/45 backdrop-blur-md border-b border-juiceBorder shrink-0 md:rounded-lg md:border md:border-juiceBorder/80 md:p-3 md:mb-4 shadow-sm">
            <div class="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
                <!-- Search & Status Filters -->
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center w-full md:w-auto">
                    <!-- Search Input -->
                    <div class="relative w-full sm:w-64">
                        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg class="h-4 w-4 text-[#7c5f4a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input type="text" id="searchInput" oninput="handleSearch(this.value)" placeholder="Search statements, triggers..." 
                            class="w-full pl-9 pr-4 py-2 bg-white/70 border border-juiceBorder focus:border-juiceOrange focus:ring-1 focus:ring-juiceOrange rounded-md text-sm text-[#24170f] placeholder-[#9a806a] outline-none transition-all">
                    </div>

                    <!-- Status Segmented Control -->
                    <div class="flex bg-white/65 p-0.5 rounded-md border border-juiceBorder text-sm font-semibold shadow-sm">
                        <button onclick="setStatusFilter('active')" id="btn-status-active" class="flex-1 sm:flex-none px-4 py-1.5 rounded-md text-juiceOrange bg-white border border-juiceBorder/70 shadow-sm transition-all duration-200">Active</button>
                        <button onclick="setStatusFilter('retired')" id="btn-status-retired" class="flex-1 sm:flex-none px-4 py-1.5 rounded-md text-[#7c5f4a] hover:text-[#24170f] transition-all duration-200">Retired</button>
                        <button onclick="setStatusFilter('all')" id="btn-status-all" class="flex-1 sm:flex-none px-4 py-1.5 rounded-md text-[#7c5f4a] hover:text-[#24170f] transition-all duration-200">All</button>
                    </div>
                </div>

                <!-- Desktop Actions Strip (hidden on mobile, handled by bottom action bar) -->
                <div class="hidden md:flex items-center gap-2.5">
                    <!-- Count indicator -->
                    <span id="countsBadge" class="text-[11px] text-[#7c5f4a] bg-juiceCard/60 px-2.5 py-1.5 rounded-md border border-juiceBorder/50">
                        Loading...
                    </span>

                    <!-- Add Category Column -->
                    <div class="flex items-center gap-1 bg-juiceCard/40 pl-2 pr-1 py-1 rounded-md border border-juiceBorder">
                        <input type="text" id="newCategoryInput" placeholder="New column..." 
                            class="bg-transparent text-xs text-[#24170f] placeholder-[#9a806a] outline-none w-24 py-0.5">
                        <button onclick="addNewCategoryColumn()" class="p-1 hover:bg-juiceCardHover text-juiceGreen rounded-md transition-colors" title="Create Column">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    <!-- AI Suggest Option -->
                    <button onclick="openSuggestModal()" class="px-3 py-1.5 bg-juiceCard hover:bg-juiceCardHover text-[#624633] hover:text-juiceGreen border border-juiceBorder hover:border-juiceGreen/30 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
                        <svg class="w-3.5 h-3.5 text-juiceGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Suggest
                    </button>

                    <!-- Refresh Button -->
                    <button onclick="refreshData()" class="p-1.5 bg-juiceCard hover:bg-juiceCardHover border border-juiceBorder hover:border-juiceBorder/80 text-[#7c5f4a] hover:text-juiceOrange rounded-md transition-all" title="Refresh Dashboard">
                        <svg class="w-4 h-4" id="refreshIcon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19" />
                        </svg>
                    </button>

                    <!-- New Juice Button -->
                    <button onclick="openCreateModal()" class="px-3.5 py-1.5 bg-gradient-to-r from-juiceOrange to-juiceLightOrange hover:from-juiceOrange hover:to-juiceOrange text-white text-xs font-bold rounded-md flex items-center gap-1.5 transition-all shadow-glow-orange hover:shadow-glow-orange-lg transform active:scale-95">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        NEW CONSTRAINT
                    </button>
                </div>
            </div>
        </section>

        <!-- Mobile Horizontal Category Selector Tabs (Sticky on mobile, hidden on desktop) -->
        <div id="mobileCategoryTabs" class="flex md:hidden overflow-x-auto scrollbar-none gap-1.5 px-4 py-2 bg-juiceDark/20 border-b border-juiceBorder shrink-0">
            <!-- Tabs injected dynamically -->
        </div>

        <!-- Kanban Board Container -->
        <main class="flex-1 overflow-x-auto overflow-y-hidden px-4 py-3 md:px-0 md:pb-6 flex gap-4 items-start" id="kanbanBoard">
            <!-- Columns or single column list will be injected here dynamically -->
            <div class="flex items-center justify-center w-full h-64 text-[#7c5f4a]">
                <div class="flex flex-col items-center gap-2">
                    <svg class="w-6 h-6 animate-spin text-juiceOrange" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-xs font-semibold">Extracting avoidance constraints...</span>
                </div>
            </div>
        </main>

        <!-- Mobile Sticky Bottom Action Bar (Sticky on mobile, hidden on desktop) -->
        <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-juiceBorder/80 px-3 pt-3 safe-bottom-pad flex items-center justify-between gap-2 z-30 shadow-[0_-10px_30px_rgba(88,52,22,0.10)]">
            <button onclick="openSuggestModal()" class="flex-1 py-3 bg-white/90 border border-juiceBorder hover:border-juiceGreen/40 text-[#4f6f1c] rounded-md text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-sm whitespace-nowrap">
                <svg class="w-4 h-4 text-juiceGreen animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI SUGGEST
            </button>
            
            <button onclick="openCreateModal()" class="flex-1 py-3 bg-gradient-to-r from-juiceOrange to-juiceLightOrange text-white text-[11px] font-black rounded-md flex items-center justify-center gap-1 transition-all shadow-glow-orange whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                NEW RULE
            </button>
        </div>
    </div>

    <!-- Toast Container -->
    <div id="toastContainer" class="fixed bottom-16 md:bottom-5 right-4 left-4 md:left-auto md:w-80 z-50 flex flex-col gap-1.5"></div>

    <!-- CREATE/EDIT BOTTOM SHEET / MODAL -->
    <div id="juiceModal" class="fixed inset-0 z-40 hidden flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300">
        <!-- Bottom sheet style for mobile, centered dialog for desktop -->
        <div class="bg-juiceCard border border-juiceBorder rounded-t-lg sm:rounded-lg w-full max-w-xl shadow-2xl overflow-hidden flex flex-col transform translate-y-full sm:translate-y-0 sm:scale-95 opacity-0 transition-all duration-300 max-h-[92vh] sm:max-h-[85vh]" id="modalContent">
            <!-- Mobile Bottom Sheet Drag Handle indicator -->
            <div class="w-12 h-1 bg-juiceBorder rounded-full mx-auto my-2 sm:hidden shrink-0"></div>

            <!-- Modal Header -->
            <div class="px-5 py-3.5 border-b border-juiceBorder/80 flex items-center justify-between bg-juiceDark/30 shrink-0">
                <h3 class="text-sm font-display font-black text-[#24170f] flex items-center gap-2" id="modalTitle">
                    Create Avoidance Constraint
                </h3>
                <button onclick="closeModal()" class="text-[#7c5f4a] hover:text-juiceOrange p-1 rounded-md hover:bg-juiceCardHover transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Modal Form -->
            <form id="juiceForm" onsubmit="handleFormSubmit(event)" class="p-5 space-y-4 overflow-y-auto flex-1">
                <input type="hidden" id="formJuiceId">
                
                <!-- Statement -->
                <div>
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-1">Statement *</label>
                    <textarea id="formStatement" required rows="3" placeholder="Define what to avoid (e.g., 'Avoid raw promises when async/await is appropriate')" 
                        class="w-full px-3 py-2 bg-juiceDark/50 border border-juiceBorder focus:border-juiceOrange focus:ring-1 focus:ring-juiceOrange rounded-md text-xs text-[#24170f] placeholder-[#9a806a] outline-none transition-all resize-none"></textarea>
                </div>

                <!-- Category & Scope -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-1">Category</label>
                        <input type="text" id="formCategory" list="existingCategories" placeholder="e.g., Styling, Code Quality" 
                            class="w-full px-3 py-2 bg-juiceDark/50 border border-juiceBorder focus:border-juiceOrange focus:ring-1 focus:ring-juiceOrange rounded-md text-xs text-[#24170f] placeholder-[#9a806a] outline-none transition-all">
                        <datalist id="existingCategories"></datalist>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-1">Scope</label>
                        <select id="formScope" onchange="handleScopeChange(this.value)" 
                            class="w-full px-3 py-2 bg-juiceDark/50 border border-juiceBorder focus:border-juiceOrange focus:ring-1 focus:ring-juiceOrange rounded-md text-xs text-[#24170f] outline-none transition-all">
                            <option value="global">global</option>
                            <option value="project">project</option>
                            <option value="repo">repo</option>
                            <option value="agent">agent</option>
                        </select>
                    </div>
                </div>

                <!-- Scope Identity / Scope Key -->
                <div id="scopeIdentityGroup" class="hidden p-3 bg-juiceDark/40 rounded-md border border-juiceBorder/80 space-y-2.5">
                    <div class="text-[10px] font-bold text-juiceLightOrange flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Scope Context Identity
                    </div>
                    
                    <div>
                        <label class="block text-[9px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-1" id="scopeKeyLabel">Scope Key</label>
                        <input type="text" id="formScopeKey" placeholder="e.g., project-name, repo-path" 
                            class="w-full px-3 py-1.5 bg-juiceDark border border-juiceBorder focus:border-juiceOrange focus:ring-1 focus:ring-juiceOrange rounded-md text-xs text-[#24170f] outline-none transition-all">
                    </div>

                    <div class="grid grid-cols-3 gap-2 pt-0.5">
                        <div>
                            <label class="block text-[8px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-0.5">Project</label>
                            <input type="text" id="formIdentityProject" placeholder="optional" class="w-full px-2 py-1 bg-juiceDark border border-juiceBorder rounded text-[10px] text-[#24170f] outline-none">
                        </div>
                        <div>
                            <label class="block text-[8px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-0.5">Repo</label>
                            <input type="text" id="formIdentityRepo" placeholder="optional" class="w-full px-2 py-1 bg-juiceDark border border-juiceBorder rounded text-[10px] text-[#24170f] outline-none">
                        </div>
                        <div>
                            <label class="block text-[8px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-0.5">Agent</label>
                            <input type="text" id="formIdentityAgent" placeholder="optional" class="w-full px-2 py-1 bg-juiceDark border border-juiceBorder rounded text-[10px] text-[#24170f] outline-none">
                        </div>
                    </div>
                </div>

                <!-- Triggers Input -->
                <div>
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-1">Triggers (comma separated)</label>
                    <input type="text" id="formTriggers" placeholder="e.g., build, deploy, test, tailwind" 
                        class="w-full px-3 py-2 bg-juiceDark/50 border border-juiceBorder focus:border-juiceOrange focus:ring-1 focus:ring-juiceOrange rounded-md text-xs text-[#24170f] placeholder-[#9a806a] outline-none transition-all">
                    <p class="text-[9px] text-[#7c5f4a] mt-1">Triggers match context or behavior hooks to activate this juice rule.</p>
                </div>

                <!-- Confidence & Strength -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-[10px] font-bold uppercase tracking-wider text-[#7c5f4a]">Confidence</label>
                            <span id="confidenceVal" class="text-xs font-bold text-juiceGreen">0.70</span>
                        </div>
                        <input type="range" id="formConfidence" min="0" max="1" step="0.05" value="0.7" oninput="document.getElementById('confidenceVal').innerText = Number(this.value).toFixed(2)"
                            class="w-full h-1 bg-juiceDark rounded-md appearance-none cursor-pointer accent-juiceGreen">
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-[10px] font-bold uppercase tracking-wider text-[#7c5f4a]">Strength</label>
                            <span id="strengthVal" class="text-xs font-bold text-juiceOrange">0.70</span>
                        </div>
                        <input type="range" id="formStrength" min="0" max="1" step="0.05" value="0.7" oninput="document.getElementById('strengthVal').innerText = Number(this.value).toFixed(2)"
                            class="w-full h-1 bg-juiceDark rounded-md appearance-none cursor-pointer accent-juiceOrange">
                    </div>
                </div>

                <!-- Modal Actions -->
                <div class="flex justify-end gap-2.5 pt-4 border-t border-juiceBorder/60">
                    <button type="button" onclick="closeModal()" class="px-3.5 py-1.5 bg-juiceDark/40 hover:bg-juiceDark text-[#7c5f4a] hover:text-[#24170f] border border-juiceBorder rounded-md text-xs font-semibold transition-all">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-1.5 bg-gradient-to-r from-juiceOrange to-juiceLightOrange hover:from-juiceOrange hover:to-juiceOrange text-white text-xs font-bold rounded-md shadow-glow-orange transition-all transform active:scale-95">
                        Save Constraint
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- AI SUGGEST BOTTOM SHEET / MODAL -->
    <div id="suggestModal" class="fixed inset-0 z-40 hidden flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300">
        <!-- Bottom sheet style for mobile, centered dialog for desktop -->
        <div class="bg-juiceCard border border-juiceBorder rounded-t-lg sm:rounded-lg w-full max-w-lg shadow-2xl overflow-hidden flex flex-col transform translate-y-full sm:translate-y-0 sm:scale-95 opacity-0 transition-all duration-300 max-h-[92vh] sm:max-h-[85vh]" id="suggestModalContent">
            <!-- Mobile Bottom Sheet Drag Handle indicator -->
            <div class="w-12 h-1 bg-juiceBorder rounded-full mx-auto my-2 sm:hidden shrink-0"></div>

            <!-- Modal Header -->
            <div class="px-5 py-3.5 border-b border-juiceBorder/80 flex items-center justify-between bg-juiceDark/30 shrink-0">
                <h3 class="text-sm font-display font-black text-juiceGreen flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Suggest Avoidance Constraint
                </h3>
                <button onclick="closeSuggestModal()" class="text-[#7c5f4a] hover:text-juiceOrange p-1 rounded-md hover:bg-juiceCardHover transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Suggest Form -->
            <div class="p-5 space-y-4 overflow-y-auto flex-1">
                <p class="text-[11px] text-[#7c5f4a] leading-relaxed">
                    Enter corrective feedback or an unwanted behavior. Juice will suggest a negative avoidance constraint with triggers, category, and weights.
                </p>

                <div>
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-1">Feedback / Behavior to capture *</label>
                    <textarea id="suggestFeedback" required rows="3" placeholder="e.g., 'The developer asked me to stop using inline styles and stick strictly to Tailwind classes, and always use semantic HTML.'" 
                        class="w-full px-3 py-2 bg-juiceDark/50 border border-juiceBorder focus:border-juiceGreen focus:ring-1 focus:ring-juiceGreen rounded-md text-xs text-[#24170f] placeholder-[#9a806a] outline-none transition-all resize-none"></textarea>
                </div>

                <div class="grid grid-cols-3 gap-2">
                    <div>
                        <label class="block text-[8px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-0.5">Project</label>
                        <input type="text" id="suggestProject" placeholder="optional" class="w-full px-2 py-1 bg-juiceDark border border-juiceBorder rounded text-xs text-[#24170f] outline-none">
                    </div>
                    <div>
                        <label class="block text-[8px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-0.5">Repo</label>
                        <input type="text" id="suggestRepo" placeholder="optional" class="w-full px-2 py-1 bg-juiceDark border border-juiceBorder rounded text-xs text-[#24170f] outline-none">
                    </div>
                    <div>
                        <label class="block text-[8px] font-bold uppercase tracking-wider text-[#7c5f4a] mb-0.5">Agent</label>
                        <input type="text" id="suggestAgent" placeholder="optional" class="w-full px-2 py-1 bg-juiceDark border border-juiceBorder rounded text-xs text-[#24170f] outline-none">
                    </div>
                </div>

                <div id="suggestLoading" class="hidden flex items-center justify-center gap-2 py-2 text-xs text-juiceGreen">
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Synthesizing avoidance constraint...
                </div>

                <div class="flex justify-end gap-2.5 pt-2">
                    <button type="button" onclick="closeSuggestModal()" class="px-3.5 py-1.5 bg-juiceDark/40 hover:bg-juiceDark text-[#7c5f4a] hover:text-[#24170f] border border-juiceBorder rounded-md text-xs font-semibold transition-all">
                        Cancel
                    </button>
                    <button type="button" onclick="submitSuggest()" class="px-4 py-1.5 bg-gradient-to-r from-juiceGreen to-emerald-500 hover:from-juiceGreen hover:to-juiceGreen text-[#24170f] text-xs font-bold rounded-md shadow-glow-green transition-all transform active:scale-95">
                        Get Suggestion
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- CLIENT SIDE JAVASCRIPT -->
    <script>
        // Global State
        const state = {
            juices: [],
            categories: [],
            statusFilter: 'active',
            searchQuery: '',
            manifest: null,
            loading: false,
            activeCategory: '' // Active category for mobile view
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            refreshData();

            // Setup Esc Key Close
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    closeSuggestModal();
                }
            });
        });

        // Notify helper
        function showToast(message, type = 'success') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = \`flex items-center gap-2.5 px-3.5 py-2.5 rounded-md border text-xs font-bold shadow-xl transform translate-y-2 opacity-0 transition-all duration-300 \${
                type === 'success' 
                    ? 'bg-juiceCard border-juiceGreen/20 text-juiceGreen shadow-juiceGreen/5' 
                    : 'bg-juiceCard border-juiceOrange/20 text-juiceOrange shadow-juiceOrange/5'
            }\`;
            
            const icon = type === 'success' 
                ? '<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>'
                : '<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';

            toast.innerHTML = icon;
            const messageSpan = document.createElement('span');
            messageSpan.textContent = String(message ?? '');
            toast.appendChild(messageSpan);
            container.appendChild(toast);

            // Trigger animations
            setTimeout(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            }, 10);

            // Remove after 3.5s
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }

        function escapeHtml(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function parseScopeKey(record) {
            const key = record.scope_key || '';
            if (!key.includes(':')) return '';
            return key.split(':').slice(1).join(':');
        }

        function normalizedScore(value) {
            const numeric = Number(value);
            return Number.isFinite(numeric) ? Math.max(0, Math.min(1, numeric)) : 0.7;
        }

        // Fetch Data
        async function refreshData() {
            if (state.loading) return;
            state.loading = true;
            
            const refreshIcon = document.getElementById('refreshIcon');
            const refreshIconMobile = document.getElementById('refreshIconMobile');
            if (refreshIcon) refreshIcon.classList.add('animate-spin');
            if (refreshIconMobile) refreshIconMobile.classList.add('animate-spin');

            try {
                const [response, categoriesResponse, manifestResponse] = await Promise.all([
                    fetch(\`/api/juices?status=\${state.statusFilter}\`),
                    fetch('/api/categories'),
                    fetch('/api/manifest')
                ]);
                if (!response.ok) throw new Error('Failed to fetch constraints');
                state.juices = await response.json();
                if (categoriesResponse.ok) state.categories = await categoriesResponse.json();
                if (manifestResponse.ok) state.manifest = await manifestResponse.json();
                renderBoard();
            } catch (error) {
                console.error(error);
                showToast('Error loading constraints: ' + error.message, 'error');
                document.getElementById('kanbanBoard').innerHTML = \`
                    <div class="flex flex-col items-center justify-center w-full h-64 text-[#7c5f4a] gap-2 px-4 text-center">
                        <svg class="w-8 h-8 text-juiceOrange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span class="text-xs font-bold text-[#624633]">Failed to sync with backend server</span>
                        <button onclick="refreshData()" class="mt-1 px-3 py-1.5 bg-juiceCard hover:bg-juiceCardHover text-[#624633] hover:text-[#24170f] text-xs rounded-md font-medium transition-colors">
                            Retry Connection
                        </button>
                    </div>
                \`;
            } finally {
                state.loading = false;
                if (refreshIcon) refreshIcon.classList.remove('animate-spin');
                if (refreshIconMobile) refreshIconMobile.classList.remove('animate-spin');
            }
        }

        async function fetchManifest() {
            try {
                const response = await fetch('/api/manifest');
                if (response.ok) {
                    state.manifest = await response.json();
                    populateCategoriesDatalist();
                }
            } catch (e) {
                console.warn('Manifest load failed', e);
            }
        }

        function populateCategoriesDatalist() {
            const datalist = document.getElementById('existingCategories');
            if (!datalist) return;
            datalist.innerHTML = '';
            
            // Collect registered categories from API/manifest
            const categories = new Set();
            state.categories.forEach(c => { if (c.name) categories.add(c.name); });
            if (state.manifest && state.manifest.areas) {
                state.manifest.areas.forEach(a => { if (a.category) categories.add(a.category); });
            }
            
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                datalist.appendChild(option);
            });
        }

        // Filters updates
        function setStatusFilter(filter) {
            state.statusFilter = filter;
            ['active', 'retired', 'all'].forEach(f => {
                const btn = document.getElementById(\`btn-status-\${f}\`);
                if (f === filter) {
                    btn.className = 'flex-1 sm:flex-none px-3 py-1 rounded-md text-juiceOrange bg-white border border-juiceBorder/70 shadow-sm transition-all duration-200';
                } else {
                    btn.className = 'flex-1 sm:flex-none px-3 py-1 rounded-md text-[#7c5f4a] hover:text-[#24170f] transition-all duration-200';
                }
            });
            refreshData();
        }

        function handleSearch(query) {
            state.searchQuery = query.toLowerCase().trim();
            renderBoard();
        }

        async function addNewCategoryColumn() {
            const input = document.getElementById('newCategoryInput');
            const catName = input.value.trim();
            if (!catName) return;

            if (state.categories.some(c => c.name === catName)) {
                showToast('Category already exists', 'error');
                return;
            }

            try {
                const response = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: catName })
                });
                if (!response.ok) throw new Error('Failed to register category');
                state.categories.push(await response.json());
                input.value = '';
                renderBoard();
                showToast(\`Category "\${catName}" created\`);
            } catch (error) {
                showToast('Failed to create category: ' + error.message, 'error');
            }
        }

        // Set active category tab for mobile
        function setMobileCategory(category) {
            state.activeCategory = category;
            renderBoard();
        }

        // Render Kanban Board
        function renderBoard() {
            const board = document.getElementById('kanbanBoard');
            const mobileTabsContainer = document.getElementById('mobileCategoryTabs');
            if (!board) return;

            // Filter juices based on search query
            const filteredJuices = state.juices.filter(j => {
                if (!state.searchQuery) return true;
                const statementMatch = j.statement.toLowerCase().includes(state.searchQuery);
                const categoryMatch = j.category && j.category.toLowerCase().includes(state.searchQuery);
                const scopeMatch = j.scope && j.scope.toLowerCase().includes(state.searchQuery);
                const triggerMatch = j.triggers && j.triggers.some(t => t.toLowerCase().includes(state.searchQuery));
                return statementMatch || categoryMatch || scopeMatch || triggerMatch;
            });

            // Count summary
            const countsBadge = document.getElementById('countsBadge');
            if (countsBadge) {
                countsBadge.innerText = \`\${filteredJuices.length} \${state.statusFilter !== 'all' ? state.statusFilter : ''} constraints\`;
            }

            // Identify all categories to show
            const categoriesSet = new Set();
            
            state.categories.forEach(c => { if (c.name) categoriesSet.add(c.name); });
            if (state.manifest && state.manifest.areas) {
                state.manifest.areas.forEach(a => { if (a.category) categoriesSet.add(a.category); });
            }

            const categories = Array.from(categoriesSet).sort();
            
            // Ensure Uncategorized is accounted for
            const hasUncategorized = filteredJuices.some(j => !j.category) || categories.length === 0;
            
            // Setup mobile active category default if not set or invalid
            const allCategoriesList = [];
            if (hasUncategorized) {
                allCategoriesList.push(''); // Empty string represents Uncategorized
            }
            categories.forEach(cat => allCategoriesList.push(cat));

            if (!allCategoriesList.includes(state.activeCategory)) {
                state.activeCategory = allCategoriesList[0] ?? '';
            }

            // Render Mobile Tabs
            if (mobileTabsContainer) {
                let tabsHtml = '';
                allCategoriesList.forEach(cat => {
                    const displayName = cat === '' ? 'Uncategorized' : cat;
                    const catJuicesCount = filteredJuices.filter(j => (cat === '' ? !j.category : j.category === cat)).length;
                    const isActive = state.activeCategory === cat;
                    
                    tabsHtml += \`
                        <button onclick="setMobileCategory('\${escapeHtml(cat)}')" class="px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap border transition-all shrink-0 \${
                            isActive 
                                ? 'bg-juiceOrange/10 border-juiceOrange/30 text-juiceOrange' 
                                : 'bg-juiceCard border-juiceBorder text-[#7c5f4a] hover:text-[#24170f]'
                        }">
                            \${escapeHtml(displayName)}
                            <span class="ml-1 text-[9px] px-1 py-0.5 rounded-full bg-juiceDark/40 text-[#7c5f4a]">\${catJuicesCount}</span>
                        </button>
                    \`;
                });
                mobileTabsContainer.innerHTML = tabsHtml;
            }

            // Render Board columns
            let html = '';

            // Desktop displays all columns; Mobile displays only the active selected category column
            const isMobile = window.innerWidth < 768;

            // 1. Uncategorized Column
            if (hasUncategorized) {
                const uncategorizedJuices = filteredJuices.filter(j => !j.category);
                const shouldShow = !isMobile || state.activeCategory === '';
                if (shouldShow) {
                    html += renderColumnHtml('Uncategorized', '', uncategorizedJuices, isMobile);
                }
            }

            // 2. Category Columns
            categories.forEach(cat => {
                const columnJuices = filteredJuices.filter(j => j.category === cat);
                const shouldShow = !isMobile || state.activeCategory === cat;
                if (shouldShow) {
                    html += renderColumnHtml(cat, cat, columnJuices, isMobile);
                }
            });

            if (filteredJuices.length === 0 && categories.length === 0) {
                html = \`
                    <div class="flex flex-col items-center justify-center w-full py-16 text-[#7c5f4a] gap-2 px-4 text-center">
                        <svg class="w-10 h-10 text-[#24170f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span class="text-xs font-bold text-[#624633]">No constraints found</span>
                        <p class="text-[10px] text-[#7c5f4a]">Try adjusting filters or create a new avoidance constraint.</p>
                    </div>
                \`;
            }

            board.innerHTML = html;
            populateCategoriesDatalist();
        }

        // Window resize handler to re-render board view appropriately
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                renderBoard();
            }, 150);
        });

        // Render Column Template
        function renderColumnHtml(displayName, categoryValue, juices, isMobile) {
            const escapedCategory = escapeHtml(categoryValue);
            const escapedDisplayName = escapeHtml(displayName);
            
            let cardsHtml = '';
            juices.forEach(j => {
                cardsHtml += renderCardHtml(j);
            });

            if (juices.length === 0) {
                cardsHtml = \`
                    <div class="flex-1 flex flex-col items-center justify-center py-12 border border-dashed border-juiceBorder rounded-md text-[#7c5f4a] text-xs">
                        No rules in this category
                    </div>
                \`;
            }

            // Mobile column takes full width, desktop columns are fixed width
            const columnWidthClass = isMobile ? 'w-full h-full' : 'w-80 shrink-0 h-full';
            const maxHeightClass = 'max-h-full';

            return \`
                <div class="\${columnWidthClass} flex flex-col \${maxHeightClass} bg-juiceCard/20 border border-juiceBorder md:border-juiceBorder/80 rounded-md p-3.5 transition-all duration-300"
                    data-category="\${escapedCategory}"
                    ondragover="handleDragOver(event)"
                    ondragleave="handleDragLeave(event)"
                    ondrop="handleDrop(event, this.dataset.category || '')">
                    
                    <!-- Column Header (Hidden on mobile as tabs display category name) -->
                    <div class="hidden md:flex items-center justify-between mb-3 shrink-0">
                        <div class="flex items-center gap-1.5">
                            <h4 class="text-xs font-display font-black text-[#24170f] truncate max-w-[160px]">\${escapedDisplayName}</h4>
                            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-juiceDark text-[#7c5f4a]">\${juices.length}</span>
                        </div>
                        <button data-category="\${escapedCategory}" onclick="openCreateModal(this.dataset.category || '')" class="p-1 hover:bg-juiceCardHover text-[#7c5f4a] hover:text-juiceOrange rounded-md transition-colors" title="Add to this category">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    <!-- Column Cards Scroll Container -->
                    <div class="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                        \${cardsHtml}
                    </div>
                </div>
            \`;
                });
                mobileTabsContainer.innerHTML = tabsHtml;
            }

            // Render Board columns
            let html = '';

            // Desktop displays all columns; Mobile displays only the active selected category column
            const isMobile = window.innerWidth < 768;

            // 1. Uncategorized Column
            if (hasUncategorized) {
                const uncategorizedJuices = filteredJuices.filter(j => !j.category);
                const shouldShow = !isMobile || state.activeCategory === '';
                if (shouldShow) {
                    html += renderColumnHtml('Uncategorized', '', uncategorizedJuices, isMobile);
                }
            }

            // 2. Category Columns
            categories.forEach(cat => {
                const columnJuices = filteredJuices.filter(j => j.category === cat);
                const shouldShow = !isMobile || state.activeCategory === cat;
                if (shouldShow) {
                    html += renderColumnHtml(cat, cat, columnJuices, isMobile);
                }
            });

            if (filteredJuices.length === 0 && categories.length === 0) {
                html = \`
                    <div class="flex flex-col items-center justify-center w-full py-16 text-[#7c5f4a] gap-2 px-4 text-center">
                        <svg class="w-10 h-10 text-[#24170f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span class="text-xs font-bold text-[#624633]">No constraints found</span>
                        <p class="text-[10px] text-[#7c5f4a]">Try adjusting filters or create a new avoidance constraint.</p>
                    </div>
                \`;
            }

            board.innerHTML = html;
            populateCategoriesDatalist();
        }

        // Window resize handler to re-render board view appropriately
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                renderBoard();
            }, 150);
        });

        // Render Column Template
        function renderColumnHtml(displayName, categoryValue, juices, isMobile) {
            const escapedCategory = escapeHtml(categoryValue);
            const escapedDisplayName = escapeHtml(displayName);
            
            let cardsHtml = '';
            juices.forEach(j => {
                cardsHtml += renderCardHtml(j);
            });

            if (juices.length === 0) {
                cardsHtml = \`
                    <div class="flex-1 flex flex-col items-center justify-center py-12 border border-dashed border-juiceBorder rounded-md text-[#7c5f4a] text-xs">
                        No rules in this category
                    </div>
                \`;
            }

            // Mobile column takes full width, desktop columns are fixed width
            const columnWidthClass = isMobile ? 'w-full h-full' : 'w-80 shrink-0 h-full';
            const maxHeightClass = 'max-h-full';

            return \`
                <div class="\${columnWidthClass} flex flex-col \${maxHeightClass} bg-juiceCard/20 border border-juiceBorder md:border-juiceBorder/80 rounded-md p-3.5 transition-all duration-300"
                    data-category="\${escapedCategory}"
                    ondragover="handleDragOver(event)"
                    ondragleave="handleDragLeave(event)"
                    ondrop="handleDrop(event, this.dataset.category || '')">
                    
                    <!-- Column Header (Hidden on mobile as tabs display category name) -->
                    <div class="hidden md:flex items-center justify-between mb-3 shrink-0">
                        <div class="flex items-center gap-1.5">
                            <h4 class="text-xs font-display font-black text-[#24170f] truncate max-w-[160px]">\${escapedDisplayName}</h4>
                            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-juiceDark text-[#7c5f4a]">\${juices.length}</span>
                        </div>
                        <button data-category="\${escapedCategory}" onclick="openCreateModal(this.dataset.category || '')" class="p-1 hover:bg-juiceCardHover text-[#7c5f4a] hover:text-juiceOrange rounded-md transition-colors" title="Add to this category">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    <!-- Column Cards Scroll Container -->
                    <div class="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                        \${cardsHtml}
                    </div>
                </div>
            \`;
        }

        // Render Card Template
        function renderCardHtml(j) {
            const id = escapeHtml(j.id);
            const statement = escapeHtml(j.statement);
            const scope = escapeHtml(j.scope || 'global');
            const scopeKey = escapeHtml(j.scope_key || '');
            
            const isRetired = j.status === 'retired';
            const retiredClass = isRetired ? 'opacity-50 border-juiceBorder/60 grayscale' : '';
            
            // Triggers chips: max 3 shown with +N overflow
            let triggersHtml = '';
            if (j.triggers && j.triggers.length > 0) {
                const shownTriggers = j.triggers.slice(0, 3);
                const overflowCount = j.triggers.length - 3;
                shownTriggers.forEach(t => {
                    triggersHtml += \`<span class="text-[11px] font-medium px-1.5 py-0.5 rounded bg-juiceDark text-[#7c5f4a] border border-juiceBorder truncate max-w-[90px]">\${escapeHtml(t)}</span>\`;
                });
                if (overflowCount > 0) {
                    triggersHtml += \`<span class="text-[11px] font-medium px-1.5 py-0.5 rounded bg-juiceDark text-[#624633] border border-juiceBorder font-bold">+\${overflowCount}</span>\`;
                }
            }

            // Relative date
            const dateStr = j.updated_at ? new Date(j.updated_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : '';

            // Action Buttons based on status (small right-side kebab/action cluster)
            let actionsHtml = '';
            if (isRetired) {
                actionsHtml = \`
                    <button data-id="\${id}" onclick="restoreJuice(this.dataset.id)" class="p-1 text-[#7c5f4a] hover:text-juiceGreen hover:bg-juiceDark rounded transition-colors" title="Restore rule">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19" />
                        </svg>
                    </button>
                \`;
            } else {
                actionsHtml = \`
                    <button data-id="\${id}" onclick="openEditModal(this.dataset.id)" class="p-1 text-[#7c5f4a] hover:text-[#24170f] hover:bg-juiceDark rounded transition-colors" title="Edit">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button data-id="\${id}" onclick="retireJuice(this.dataset.id)" class="p-1 text-[#7c5f4a] hover:text-juiceOrange hover:bg-juiceDark rounded transition-colors" title="Retire">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                \`;
            }

            const scopeKeyDisplay = scopeKey ? \` (\${scopeKey})\` : '';
            const retiredLabel = isRetired ? \`<span class="text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-juiceDark text-[#7c5f4a] border border-juiceBorder shrink-0">Retired</span>\` : '';

            return \`
                <div class="bg-white/72 hover:bg-white/90 rounded-md p-3 shadow-[0_8px_24px_rgba(88,52,22,0.08)] hover:shadow-[0_10px_28px_rgba(88,52,22,0.12)] transition-all duration-200 cursor-grab active:cursor-grabbing relative group/card \${retiredClass}"
                    draggable="true"
                    data-id="\${id}"
                    ondragstart="handleDragStart(event, this.dataset.id)">
                    
                    <!-- Metadata row: category/date/scope/retired label in tiny muted text -->
                    <div class="flex items-center justify-between mb-2">
                        <div class="text-[11px] md:text-xs text-[#8a705d] font-medium flex flex-wrap items-center gap-1.5 overflow-hidden">
                            \${retiredLabel}
                            <span class="font-bold text-[#624633] capitalize">\${scope}\${scopeKeyDisplay}</span>
                            <span>•</span>
                            <span class="truncate max-w-[80px]" title="\${escapeHtml(j.category || 'uncategorized')}">\${escapeHtml(j.category || 'uncategorized')}</span>
                            <span>•</span>
                            <span>\${dateStr}</span>
                        </div>
                        <div class="flex items-center gap-0.5 shrink-0 ml-2 md:opacity-0 group-hover/card:opacity-100 transition-opacity">
                            \${actionsHtml}
                        </div>
                    </div>

                    <!-- Statement Text -->
                    <p class="text-sm md:text-[15px] leading-relaxed text-[#24170f] font-medium mb-3 break-words line-clamp-4 hover:line-clamp-none transition-all duration-300">
                        \${statement}
                    </p>

                    <!-- Triggers & Numeric Score Indicators -->
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <div class="flex flex-wrap gap-1">
                            \${triggersHtml}
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#f3f8df] text-[#4f6f1c] border border-[#dce8ba]" title="Confidence">C \${normalizedScore(j.confidence).toFixed(2)}</span>
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#fff0e6] text-juiceOrange border border-[#ffd3b8]" title="Strength">S \${normalizedScore(j.strength).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            \`;
        }

        // HTML5 Drag and Drop Handlers
        function handleDragStart(e, id) {
            e.dataTransfer.setData('text/plain', id);
            e.dataTransfer.effectAllowed = 'move';
            // Subtle visual feedback
            setTimeout(() => {
                const card = e.target;
                if (card && card.classList) card.classList.add('opacity-40');
            }, 0);
        }

        // Reset opacity when drag ends
        document.addEventListener('dragend', (e) => {
            if (e.target && e.target.classList) {
                e.target.classList.remove('opacity-40');
            }
        });

        function handleDragOver(e) {
            e.preventDefault();
            const col = e.currentTarget;
            if (col) col.classList.add('drag-over');
        }

        function handleDragLeave(e) {
            const col = e.currentTarget;
            if (col) col.classList.remove('drag-over');
        }

        async function handleDrop(e, targetCategory) {
            e.preventDefault();
            const col = e.currentTarget;
            if (col) col.classList.remove('drag-over');

            const id = e.dataTransfer.getData('text/plain');
            if (!id) return;

            // Optimistic updates
            const record = state.juices.find(j => j.id === id);
            if (!record) return;

            const oldCategory = record.category;
            if (oldCategory === targetCategory) return;

            record.category = targetCategory;
            renderBoard();

            try {
                const response = await fetch(\`/api/juices/\${id}\`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: targetCategory })
                });

                if (!response.ok) throw new Error('Failed to update category on drop');
                showToast(\`Moved rule to "\${targetCategory || 'Uncategorized'}"\`);
            } catch (error) {
                console.error(error);
                // Rollback
                record.category = oldCategory;
                renderBoard();
                showToast('Failed to save category move: ' + error.message, 'error');
            }
        }

        // Modal triggers
        function openCreateModal(defaultCategory = '') {
            document.getElementById('formJuiceId').value = '';
            document.getElementById('formStatement').value = '';
            document.getElementById('formCategory').value = defaultCategory;
            document.getElementById('formScope').value = 'global';
            document.getElementById('formScopeKey').value = '';
            document.getElementById('formTriggers').value = '';
            document.getElementById('formConfidence').value = '0.7';
            document.getElementById('formStrength').value = '0.7';
            document.getElementById('confidenceVal').innerText = '0.70';
            document.getElementById('strengthVal').innerText = '0.70';

            // Reset optional identity fields
            document.getElementById('formIdentityProject').value = '';
            document.getElementById('formIdentityRepo').value = '';
            document.getElementById('formIdentityAgent').value = '';

            handleScopeChange('global');

            document.getElementById('modalTitle').innerHTML = \`
                <svg class="w-4 h-4 text-juiceOrange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Create Avoidance Constraint
            \`;

            showModal();
        }

        function openEditModal(id) {
            const record = state.juices.find(j => j.id === id);
            if (!record) return;

            document.getElementById('formJuiceId').value = record.id;
            document.getElementById('formStatement').value = record.statement;
            document.getElementById('formCategory').value = record.category || '';
            document.getElementById('formScope').value = record.scope || 'global';
            document.getElementById('formScopeKey').value = parseScopeKey(record);
            document.getElementById('formTriggers').value = (record.triggers || []).join(', ');
            document.getElementById('formConfidence').value = normalizedScore(record.confidence);
            document.getElementById('formStrength').value = normalizedScore(record.strength);
            document.getElementById('confidenceVal').innerText = normalizedScore(record.confidence).toFixed(2);
            document.getElementById('strengthVal').innerText = normalizedScore(record.strength).toFixed(2);

            // Pre-fill optional identity fields if they exist
            document.getElementById('formIdentityProject').value = record.project || '';
            document.getElementById('formIdentityRepo').value = record.repo || '';
            document.getElementById('formIdentityAgent').value = record.agent || '';

            handleScopeChange(record.scope || 'global');

            document.getElementById('modalTitle').innerHTML = \`
                <svg class="w-4 h-4 text-juiceOrange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Avoidance Constraint
            \`;

            showModal();
        }

        function handleScopeChange(scope) {
            const group = document.getElementById('scopeIdentityGroup');
            const label = document.getElementById('scopeKeyLabel');
            
            if (scope === 'global') {
                group.classList.add('hidden');
            } else {
                group.classList.remove('hidden');
                label.innerText = \`Scope Key (\${scope} identifier) *\`;
                document.getElementById('formScopeKey').placeholder = \`e.g., \${scope === 'project' ? 'my-web-project' : scope === 'repo' ? 'juice-repo' : 'coding-agent'}\`;
            }
        }

        function showModal() {
            const modal = document.getElementById('juiceModal');
            const content = document.getElementById('modalContent');
            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.remove('translate-y-full', 'scale-95', 'opacity-0');
            }, 10);
        }

        function closeModal() {
            const modal = document.getElementById('juiceModal');
            const content = document.getElementById('modalContent');
            content.classList.add('translate-y-full', 'scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }

        // Form Submit
        async function handleFormSubmit(e) {
            e.preventDefault();

            const id = document.getElementById('formJuiceId').value;
            const statement = document.getElementById('formStatement').value.trim();
            const category = document.getElementById('formCategory').value.trim();
            const scope = document.getElementById('formScope').value;
            const scope_key = scope !== 'global' ? document.getElementById('formScopeKey').value.trim() : '';
            const triggersRaw = document.getElementById('formTriggers').value;
            const confidence = normalizedScore(document.getElementById('formConfidence').value);
            const strength = normalizedScore(document.getElementById('formStrength').value);

            // Optional identity fields
            const project = document.getElementById('formIdentityProject').value.trim();
            const repo = document.getElementById('formIdentityRepo').value.trim();
            const agent = document.getElementById('formIdentityAgent').value.trim();

            if (scope !== 'global' && !scope_key) {
                showToast('Scope Key is required for non-global scopes', 'error');
                return;
            }

            const triggers = triggersRaw
                ? triggersRaw.split(',').map(t => t.trim()).filter(t => t.length > 0)
                : [];

            const payload = {
                statement,
                category,
                scope,
                triggers,
                confidence,
                strength
            };

            if (scope === 'project') payload.project = scope_key;
            if (scope === 'repo') payload.repo = scope_key;
            if (scope === 'agent') payload.agent = scope_key;
            if (project) payload.project = project;
            if (repo) payload.repo = repo;
            if (agent) payload.agent = agent;

            try {
                let response;
                if (id) {
                    // Update
                    response = await fetch(\`/api/juices/\${id}\`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } else {
                    // Create
                    response = await fetch('/api/juices', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Server validation failed');
                }

                closeModal();
                showToast(id ? 'Avoidance constraint updated' : 'New avoidance constraint created');
                refreshData();
            } catch (error) {
                console.error(error);
                showToast('Error saving record: ' + error.message, 'error');
            }
        }

        // Retire rule
        async function retireJuice(id) {
            if (!confirm('Are you sure you want to archive/retire this behavior rule?')) return;

            try {
                const response = await fetch(\`/api/juices/\${id}/retire\`, {
                    method: 'POST'
                });

                if (!response.ok) throw new Error('Failed to retire rule');
                showToast('Juice record retired successfully');
                refreshData();
            } catch (error) {
                console.error(error);
                showToast('Error retiring rule: ' + error.message, 'error');
            }
        }

        // Restore rule
        async function restoreJuice(id) {
            try {
                const response = await fetch(\`/api/juices/\${id}/restore\`, {
                    method: 'POST'
                });

                if (!response.ok) throw new Error('Failed to restore rule');
                showToast('Juice record restored to active state');
                refreshData();
            } catch (error) {
                console.error(error);
                showToast('Error restoring rule: ' + error.message, 'error');
            }
        }

        // Suggest behavioral rule
        function openSuggestModal() {
            document.getElementById('suggestFeedback').value = '';
            document.getElementById('suggestProject').value = '';
            document.getElementById('suggestRepo').value = '';
            document.getElementById('suggestAgent').value = '';
            
            const modal = document.getElementById('suggestModal');
            const content = document.getElementById('suggestModalContent');
            modal.classList.remove('hidden');
            setTimeout(() => {
                content.classList.remove('translate-y-full', 'scale-95', 'opacity-0');
            }, 10);
        }

        function closeSuggestModal() {
            const modal = document.getElementById('suggestModal');
            const content = document.getElementById('suggestModalContent');
            content.classList.add('translate-y-full', 'scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                document.getElementById('suggestLoading').classList.add('hidden');
            }, 300);
        }

        async function submitSuggest() {
            const feedback = document.getElementById('suggestFeedback').value.trim();
            const project = document.getElementById('suggestProject').value.trim();
            const repo = document.getElementById('suggestRepo').value.trim();
            const agent = document.getElementById('suggestAgent').value.trim();

            if (!feedback) {
                showToast('Feedback text is required', 'error');
                return;
            }

            const loader = document.getElementById('suggestLoading');
            loader.classList.remove('hidden');

            try {
                const response = await fetch('/api/suggest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ feedback, project, repo, agent })
                });

                if (!response.ok) throw new Error('Failed to suggest avoidance constraint');
                const suggestion = await response.json();

                closeSuggestModal();
                
                // Pre-fill create modal with suggestion
                openCreateModal(suggestion.category || '');
                document.getElementById('formStatement').value = suggestion.statement || '';
                document.getElementById('formScope').value = suggestion.scope || 'global';
                document.getElementById('formScopeKey').value = parseScopeKey(suggestion);
                document.getElementById('formTriggers').value = (suggestion.triggers || []).join(', ');
                document.getElementById('formConfidence').value = normalizedScore(suggestion.confidence);
                document.getElementById('formStrength').value = normalizedScore(suggestion.strength);
                document.getElementById('confidenceVal').innerText = normalizedScore(suggestion.confidence).toFixed(2);
                document.getElementById('strengthVal').innerText = normalizedScore(suggestion.strength).toFixed(2);

                // Pre-fill optional identity fields
                document.getElementById('formIdentityProject').value = project;
                document.getElementById('formIdentityRepo').value = repo;
                document.getElementById('formIdentityAgent').value = agent;

                handleScopeChange(suggestion.scope || 'global');

                showToast('Loaded avoidance constraint suggestion', 'success');
            } catch (error) {
                console.error(error);
                showToast('Suggestion failed: ' + error.message, 'error');
            } finally {
                loader.classList.add('hidden');
            }
        }
    </script>
</body>
</html>`;
}
