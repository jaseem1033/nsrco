document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('productsGrid');
    if (!container) return; // Exit if not on products list page

    // Category label mappings
    const catLabels = {
        'pressure-fryer': 'Pressure Fryer',
        'open-fryer': 'Open / Rack Fryer',
        'massage-tumblers': 'Vacuum Tumbler',
        'others': 'Other Equipment'
    };

    // 1. Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const selectedCategory = params.get('category');

    // Set active class on corresponding tab if tab navigation exists
    if (selectedCategory) {
        document.querySelectorAll('.cat-tab').forEach(tab => {
            if (tab.dataset.cat === selectedCategory) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    function renderFilteredProducts(cat) {
        // 2. Filter Products
        let filteredProducts = productsData;
        if (cat && cat !== 'all') {
            filteredProducts = productsData.filter(p => p.category === cat);
        }

        // 3. Sort by Priority (Low number = High priority)
        filteredProducts.sort((a, b) => a.priority - b.priority);

        // 4. Render
        if (filteredProducts.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-white py-5"><p>No products found in this category.</p></div>`;
            return;
        }

        container.innerHTML = filteredProducts.map(p => `
            <a class="product-card" href="product-detail.html?id=${p.id}">
                <div class="product-card-img">
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
                </div>
                <div class="product-card-body">
                    <div class="product-card-cat">${catLabels[p.category] || p.category}</div>
                    <div class="product-card-name">${p.name}</div>
                    <div class="product-card-desc">${p.description.substring(0, 80)}...</div>
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

    // Initial render
    renderFilteredProducts(selectedCategory || 'all');

    // Add click listeners to subpage tabs if they exist
    document.querySelectorAll('.cat-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderFilteredProducts(tab.dataset.cat);
            
            // Update URL search parameters without reloading
            const newUrl = new URL(window.location.href);
            if (tab.dataset.cat === 'all') {
                newUrl.searchParams.delete('category');
            } else {
                newUrl.searchParams.set('category', tab.dataset.cat);
            }
            window.history.pushState({}, '', newUrl);
        });
    });
});
