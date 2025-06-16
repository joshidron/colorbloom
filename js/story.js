document.addEventListener('DOMContentLoaded', function() {
    // Create video player elements
    const videoContainer = document.createElement('div');
    videoContainer.className = 'video-container';
    videoContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60%;
        max-width: 800px;
        min-width: 500px;
        height: auto;
        aspect-ratio: 16/9;
        z-index: 1000;
        background: rgba(0,0,0,0.9);
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 0 30px rgba(0,0,0,0.7);
        transition: all 0.3s ease;
        display: none;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.7);
        border: none;
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1001;
        font-size: 16px;
    `;

    const videoPlayer = document.createElement('video');
    videoPlayer.className = 'video-player';
    videoPlayer.style.cssText = `
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
    `;
    videoPlayer.controls = true;
    videoPlayer.playsInline = true;

    const originalStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60%',
        maxWidth: '800px',
        minWidth: '500px',
        height: 'auto',
        aspectRatio: '16/9',
        borderRadius: '10px'
    };

    videoContainer.appendChild(closeBtn);
    videoContainer.appendChild(videoPlayer);
    document.body.appendChild(videoContainer);

    document.querySelectorAll('.play-now').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const videoSrc = this.getAttribute('href');
            
            Object.entries(originalStyle).forEach(([prop, value]) => {
                videoContainer.style[prop] = value;
            });
            
            videoContainer.style.display = 'block';
            
            videoPlayer.src = videoSrc;
            videoPlayer.load();
            
            videoPlayer.oncanplay = function() {
                videoPlayer.play().then(() => {
                    console.log("Video is playing");
                }).catch(err => {
                    console.log("Autoplay was prevented:", err);
                    videoPlayer.controls = true;
                });
            };
        });
    });
    
    closeBtn.addEventListener('click', function() {
        videoContainer.style.display = 'none';
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        videoPlayer.src = '';
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoContainer.style.display === 'block') {
            videoContainer.style.display = 'none';
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            videoPlayer.src = '';
        }
    });

    document.querySelectorAll('.story-media').forEach(media => {
        let video = media.querySelector('.story-video');
        
        if (!video) return;
        
        media.addEventListener('mouseenter', function() {
            video.muted = true;
            video.play().catch(err => console.log("Autoplay blocked:", err));
        });
        
        media.addEventListener('mouseleave', function() {
            video.pause();
            video.currentTime = 0;
        });
    });
   
    let currentPage = 1;
    const itemsPerPage = 6;
    const cards = document.querySelectorAll('.story-card');
    let filteredCards = Array.from(cards);
    
    function showPage(page) {
        if (page < 1 || page > Math.ceil(filteredCards.length / itemsPerPage)) return;
        currentPage = page;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        
        cards.forEach(card => card.style.display = 'none');
        filteredCards.slice(start, end).forEach(card => card.style.display = 'block');
        
        renderPagination();
    }
    
    function changePage(direction) {
        showPage(currentPage + direction);
    }
    
    function searchCards() {
        const searchInput = document.getElementById('search').value.toLowerCase();
        filteredCards = searchInput ? Array.from(cards).filter(card => 
            card.querySelector('p').textContent.toLowerCase().includes(searchInput)
        ) : Array.from(cards);
        currentPage = 1; // Reset to first page
        showPage(currentPage);
    }
    
    function renderPagination() {
        const paginationList = document.getElementById('paginationList');
        paginationList.innerHTML = '';
        
        for (let i = 1; i <= Math.ceil(filteredCards.length / itemsPerPage); i++) {
            const pageLink = document.createElement('li');
            const link = document.createElement('a');
            link.href = "#";
            link.className = i === currentPage ? 'active' : '';
            link.textContent = i;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(i);
            });
            pageLink.appendChild(link);
            paginationList.appendChild(pageLink);
        }
        
        document.getElementById('prevBtn').disabled = currentPage === 1;
        document.getElementById('nextBtn').disabled = currentPage === Math.ceil(filteredCards.length / itemsPerPage);
    }
    
    document.getElementById('prevBtn').addEventListener('click', () => {
        changePage(-1);
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        changePage(1);
    });

    showPage(currentPage);
    
    document.getElementById('search').addEventListener('input', searchCards);
    
    function adjustBookGrid() {
        const container = document.querySelector(".container");
        if (!container) return;
        
        let screenWidth = window.innerWidth;
        
        if (screenWidth > 800) {
            container.style.display = "grid";
            container.style.gridTemplateColumns = "repeat(3, 1fr)";
        } else if (screenWidth > 500) {
            container.style.display = "grid";
            container.style.gridTemplateColumns = "repeat(2, 1fr)";
        } else {
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.alignItems = "center";
        }
    }
    
    window.addEventListener("resize", adjustBookGrid);
    adjustBookGrid();
});