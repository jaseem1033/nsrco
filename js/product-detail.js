document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  // Category labels for breadcrumbs
  const catLabels = {
    'pressure-fryer': 'Pressure Fryers',
    'open-fryer': 'Open / Rack Fryers',
    'massage-tumblers': 'Vacuum Tumblers',
    'others': 'Other Equipment'
  };

  // 1. Find Product from Array
  const product = productsData.find(p => p.id === id) || productsData[0]; // Fallback to first if not found

  // Populate basic text content
  const crumb = document.querySelector('#pd-breadcrumb-current');
  if (crumb) crumb.textContent = product.name;
  
  const crumbCat = document.querySelector('#pd-breadcrumb-cat');
  if (crumbCat) {
      crumbCat.textContent = catLabels[product.category] || product.category;
      crumbCat.href = `products.html?category=${product.category}`;
  }

  const title = document.querySelector('#pd-title');
  if (title) title.textContent = product.name;

  const desc = document.querySelector('#pd-desc');
  if (desc) desc.textContent = product.description;

  const mainImg = document.querySelector('#pd-image');
  if (mainImg) {
    mainImg.src = product.image;
    mainImg.alt = product.name;
  }

  // 2. Thumbnail Gallery Setup
  const galleryImages = Array.isArray(product.images) && product.images.length
    ? product.images
    : [product.image, product.image, product.image];
  let currentIndex = 0;

  const thumbsContainer = document.querySelector('#pd-thumbs');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = galleryImages.map((src, i) => (
      `<img src="${src}" class="pd-thumb${i === 0 ? ' active' : ''}" data-index="${i}" alt="${product.name} View ${i + 1}">`
    )).join('');

    thumbsContainer.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.classList.contains('pd-thumb')) {
        const idx = parseInt(t.getAttribute('data-index'), 10);
        if (!Number.isNaN(idx)) {
          updateImage(idx);
        }
      }
    });
  }

  function updateImage(newIndex) {
    currentIndex = newIndex;

    // Smooth image transition fade-out/fade-in
    mainImg.style.opacity = '0';
    mainImg.style.transform = 'scale(0.97)';
    setTimeout(() => {
      mainImg.src = galleryImages[currentIndex];
      mainImg.style.opacity = '1';
      mainImg.style.transform = 'scale(1)';
      
      // Update magnifying background image if zoomResult exists
      const zoomResult = document.getElementById('pd-zoom-result');
      if (zoomResult) {
        zoomResult.style.backgroundImage = `url('${galleryImages[currentIndex]}')`;
      }
    }, 200);

    if (thumbsContainer) {
      const thumbs = thumbsContainer.querySelectorAll('.pd-thumb');
      thumbs.forEach(el => el.classList.remove('active'));
      if (thumbs[currentIndex]) thumbs[currentIndex].classList.add('active');
    }
  }

  // 3. Magnifier Zoom Logic
  const zoomContainer = document.getElementById('pd-zoom-container');
  const zoomLens = document.getElementById('pd-zoom-lens');
  const zoomResult = document.getElementById('pd-zoom-result');

  if (zoomContainer && zoomLens && zoomResult) {
    zoomContainer.addEventListener('mousemove', moveLens);
    zoomContainer.addEventListener('mouseenter', () => {
      zoomLens.style.opacity = '1';
      zoomResult.style.opacity = '1';
      zoomResult.style.backgroundImage = `url('${mainImg.src}')`;
    });
    zoomContainer.addEventListener('mouseleave', () => {
      zoomLens.style.opacity = '0';
      zoomResult.style.opacity = '0';
    });

    function moveLens(e) {
      const pos = getCursorPos(e);
      let x = pos.x - (zoomLens.offsetWidth / 2);
      let y = pos.y - (zoomLens.offsetHeight / 2);

      // Boundary limits
      if (x > zoomContainer.offsetWidth - zoomLens.offsetWidth) x = zoomContainer.offsetWidth - zoomLens.offsetWidth;
      if (x < 0) x = 0;
      if (y > zoomContainer.offsetHeight - zoomLens.offsetHeight) y = zoomContainer.offsetHeight - zoomLens.offsetHeight;
      if (y < 0) y = 0;

      zoomLens.style.left = x + "px";
      zoomLens.style.top = y + "px";

      // Zoom factor calculation
      const cx = zoomResult.offsetWidth / zoomLens.offsetWidth;
      const cy = zoomResult.offsetHeight / zoomLens.offsetHeight;

      zoomResult.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
      zoomResult.style.backgroundSize = (zoomContainer.offsetWidth * cx) + "px " + (zoomContainer.offsetHeight * cy) + "px";
    }

    function getCursorPos(e) {
      const rect = zoomContainer.getBoundingClientRect();
      const x = e.pageX - rect.left - window.pageXOffset;
      const y = e.pageY - rect.top - window.pageYOffset;
      return { x: x, y: y };
    }
  }

  // 4. Populate Features List
  const featuresEl = document.querySelector('#pd-features');
  if (featuresEl && Array.isArray(product.features)) {
    featuresEl.innerHTML = product.features.map(f => (
      `<li>${f}</li>`
    )).join('');
  }

  // 5. Populate Specifications Table
  const specsTbody = document.querySelector('#pd-specs');
  if (specsTbody && product.specs) {
    specsTbody.innerHTML = Object.entries(product.specs).map(([key, value]) => (
      `<tr>
        <th>${key}</th>
        <td>${value}</td>
      </tr>`
    )).join('');
  }

  // 6. Render Related Products
  const relatedContainer = document.getElementById('related-products');
  if (relatedContainer) {
    const related = productsData
      .filter(p => p.category === product.category && p.id !== product.id)
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 4);

    if (related.length === 0) {
      relatedContainer.innerHTML = '<div class="col-12 text-center text-muted py-4"><p>No related products found.</p></div>';
    } else {
      relatedContainer.innerHTML = related.map(p => `
          <a class="product-card" href="product-detail.html?id=${p.id}">
            <div class="product-card-img">
              <img src="${p.image}" alt="${p.name}" loading="lazy">
            </div>
            <div class="product-card-body">
              <div class="product-card-cat">${catLabels[p.category] || p.category}</div>
              <div class="product-card-name">${p.name}</div>
              <div class="product-card-desc">${p.description.substring(0, 60)}...</div>
            </div>
            <div class="product-card-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </a>
       `).join('');
    }
  }
});
