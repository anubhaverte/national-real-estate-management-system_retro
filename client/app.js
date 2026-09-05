const API_BASE = "/api";

// ===== MODAL MANAGEMENT =====
function openModal(name) {
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    document.getElementById('modal-overlay').classList.remove('hidden');
    const target = document.getElementById(`modal-${name}`);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('.modal .alert').forEach(a => {
        a.classList.add('hidden');
        a.textContent = '';
    });
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

function showModalAlert(modalAlertId, message, isError = true) {
    const el = document.getElementById(modalAlertId);
    if (el) {
        el.textContent = message;
        el.className = isError ? 'alert' : 'alert success';
        el.classList.remove('hidden');
    }
}

// ===== PANEL SWITCHING =====
function showHome() {
    document.getElementById('panel-home').classList.remove('hidden');
    document.getElementById('panel-dashboard').classList.add('hidden');
    document.querySelectorAll('.dash-view').forEach(v => v.classList.add('hidden'));
    clearAlerts();
}

function navigate(viewId) {
    document.getElementById('panel-home').classList.add('hidden');
    document.getElementById('panel-dashboard').classList.remove('hidden');

    document.querySelectorAll('.dash-view').forEach(v => v.classList.add('hidden'));
    const view = document.getElementById(`view-${viewId}`);
    if (view) view.classList.remove('hidden');
    clearAlerts();

    if (viewId === 'buyerDashboard') loadBuyerDashboard();
    if (viewId === 'sellerDashboard') loadSellerDashboard();
    if (viewId === 'adminDashboard') loadAdminDashboard();
}

function updateNav(user) {
    const role = user.role;

    document.getElementById('headerAuthBtns').classList.add('hidden');
    const headerInfo = document.getElementById('headerUserInfo');
    headerInfo.innerHTML = `&#128100; <strong>${user.name}</strong> &nbsp;[${role}]`;
    headerInfo.classList.remove('hidden');

    document.getElementById('uib-name').textContent = user.name;
    document.getElementById('uib-email').textContent = user.email;
    const roleEl = document.getElementById('uib-role');
    roleEl.textContent = role;
    roleEl.className = 'uib-role-badge uib-role-' + role.toLowerCase();
    document.getElementById('uib-time').textContent = new Date().toLocaleString('en-IN');

    document.getElementById('navLogout').classList.remove('hidden');
    document.getElementById('navBuyer').classList.add('hidden');
    document.getElementById('navSeller').classList.add('hidden');
    document.getElementById('navAdmin').classList.add('hidden');

    if (role === 'BUYER') {
        document.getElementById('navBuyer').classList.remove('hidden');
        navigate('buyerDashboard');
    } else if (role === 'SELLER') {
        document.getElementById('navSeller').classList.remove('hidden');
        navigate('sellerDashboard');
    } else if (role === 'ADMIN') {
        document.getElementById('navAdmin').classList.remove('hidden');
        navigate('adminDashboard');
    }
}

// ===== ALERTS =====
function showAlert(message, isError = true) {
    const box = isError ? document.getElementById('alertBox') : document.getElementById('successBox');
    if (box) {
        box.textContent = message;
        box.classList.remove('hidden');
    }
}

function clearAlerts() {
    const a = document.getElementById('alertBox');
    const s = document.getElementById('successBox');
    if (a) a.classList.add('hidden');
    if (s) s.classList.add('hidden');
}

// ===== AUTH =====
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login failed.");

        closeModal();
        const meRes = await fetch(`${API_BASE}/auth/me`);
        const user = await meRes.json();
        updateNav(user);
    } catch (err) {
        showModalAlert('loginAlert', err.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;

    if (!name || !email || !password) {
        showModalAlert('registerAlert', 'Please fill in all required fields.');
        return;
    }

    const payload = { name, email, password, role };
    if (role === 'SELLER') {
        const agency = document.getElementById('regAgency').value.trim();
        const contact = document.getElementById('regContact').value.trim();
        if (!agency || !contact) {
            showModalAlert('registerAlert', 'Agency name and contact info are required for Seller accounts.');
            return;
        }
        payload.agency_name = agency;
        payload.contact_info = contact;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Registration failed.");

        const loginRes = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!loginRes.ok) {
            closeModal();
            openModal('login');
            showModalAlert('loginAlert', 'Account created! Please log in.', false);
            return;
        }

        closeModal();
        const meRes = await fetch(`${API_BASE}/auth/me`);
        const user = await meRes.json();
        updateNav(user);
        showAlert(`Welcome, ${user.name}! Your account has been created.`, false);
    } catch (err) {
        showModalAlert('registerAlert', err.message);
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
        location.reload();
    } catch (err) {
        showAlert(err.message);
    }
}

function toggleAgentFields() {
    const role = document.getElementById('regRole').value;
    const fields = document.getElementById('agentFields');
    if (role === 'SELLER') {
        fields.classList.remove('hidden');
    } else {
        fields.classList.add('hidden');
    }
}

async function checkSession() {
    try {
        const res = await fetch(`${API_BASE}/auth/me`);
        if (res.ok) {
            const user = await res.json();
            updateNav(user);
        } else {
            showHome();
        }
    } catch (e) {
        showHome();
    }
}

// ===== PROPERTY DETAILS MODAL =====
async function viewPropertyDetails(id) {
    openModal('propertyDetail');
    const container = document.getElementById('detailContent');
    container.innerHTML = '<em>Loading property specifications...</em>';

    try {
        const res = await fetch(`${API_BASE}/properties/${id}`);
        if (!res.ok) throw new Error("Could not fetch property details.");
        const p = await res.json();

        const pricePerSqft = Math.round(p.price / (p.sqft || 1000));
        const imgSrc = p.photo_url || '/no_image.jpg';
        const videoHtml = p.video_url ? `<p><a href="${p.video_url}" target="_blank" style="font-weight:bold;">&#127909; Watch Property Video Walkthrough</a></p>` : '';

        const amenitiesList = (p.amenities || "Parking, Lift, Security").split(',').map(a => `<span class="tag-amenity">&#10003; ${a.trim()}</span>`).join('');

        container.innerHTML = `
            <table width="100%" cellpadding="6" cellspacing="0" border="0">
                <tr>
                    <td width="40%" valign="top">
                        <img src="${imgSrc}" style="width:100%; border:2px solid #003366; box-shadow:2px 2px 5px #ccc;">
                        ${videoHtml}
                    </td>
                    <td width="60%" valign="top">
                        <h3 style="margin-top:0; color:#003366;">${p.address}, ${p.city}</h3>
                        <p><span class="badge-verified">&#10004; GOVT VERIFIED LISTING</span> &nbsp; <span class="badge-bhk">${p.bhk || 2} BHK</span> &nbsp; <span class="badge-sqft">${p.sqft || 1200} Sq. Ft.</span></p>
                        
                        <table class="data-table" style="margin:10px 0;">
                            <tr><th>Listing Type</th><td>${p.rent_or_buy === 'RENT' ? 'For Rent' : 'For Sale'}</td></tr>
                            <tr><th>Total Price</th><td><strong style="color:#800000; font-size:14px;">&#8377;${p.price.toLocaleString('en-IN')}</strong></td></tr>
                            <tr><th>Price per Sq. Ft.</th><td>&#8377;${pricePerSqft.toLocaleString('en-IN')} / sq ft</td></tr>
                            <tr><th>Listing Agent</th><td>${p.agent.agency_name} (${p.agent.contact_info})</td></tr>
                            <tr><th>Status</th><td><strong style="color:${p.status === 'AVAILABLE' ? '#006600':'#990000'}">${p.status}</strong></td></tr>
                        </table>

                        <h4>Amenities &amp; Features</h4>
                        <div>${amenitiesList}</div>

                        <h4>Remarks / Description</h4>
                        <p style="background-color:#FFFEEA; padding:8px; border:1px solid #CCCC99; font-style:italic;">${p.remarks || 'No additional remarks provided by seller.'}</p>

                        ${p.status === 'AVAILABLE' ? `<button onclick="startCheckout(${p.id})" class="cta-btn" style="background-color:#006600; border-color:#004400; margin-top:10px; width:100%;">Buy / Transact &amp; Execute Title Deed &raquo;</button>` : ''}
                    </td>
                </tr>
            </table>
        `;
    } catch (err) {
        container.innerHTML = `<p class="alert">${err.message}</p>`;
    }
}

// ===== CHECKOUT & TAX BREAKDOWN =====
let currentCheckoutProp = null;

async function startCheckout(propId) {
    try {
        const res = await fetch(`${API_BASE}/properties/${propId}`);
        if (!res.ok) throw new Error("Property info unavailable.");
        currentCheckoutProp = await res.json();

        document.getElementById('checkoutPropId').value = propId;
        const p = currentCheckoutProp;
        const price = p.price;

        let stampDuty = 0, regFee = 0, procFee = 0;
        if (p.rent_or_buy === 'BUY') {
            stampDuty = Math.round(price * 0.05);
            regFee = Math.round(price * 0.01);
            procFee = 1000;
        } else {
            stampDuty = Math.round(price * 0.01);
            regFee = 500;
            procFee = 0;
        }

        const grandTotal = price + stampDuty + regFee + procFee;

        document.getElementById('checkoutSummary').innerHTML = `
            <h4 style="margin-top:0; color:#003366;">Property: ${p.address}, ${p.city} (${p.bhk || 2} BHK - ${p.sqft || 1200} Sq. Ft.)</h4>
            <table class="data-table" style="margin:10px 0;">
                <tr><th>Cost Component</th><th>Calculation Rate</th><th>Amount (&#8377;)</th></tr>
                <tr><td>Base Consideration Price</td><td>Agreed Listing Price</td><td>&#8377;${price.toLocaleString('en-IN')}</td></tr>
                <tr><td>State Stamp Duty</td><td>${p.rent_or_buy === 'BUY' ? '5.0%' : '1.0%'}</td><td>&#8377;${stampDuty.toLocaleString('en-IN')}</td></tr>
                <tr><td>Govt Registration Fee</td><td>${p.rent_or_buy === 'BUY' ? '1.0%' : 'Flat ₹500'}</td><td>&#8377;${regFee.toLocaleString('en-IN')}</td></tr>
                <tr><td>Portal E-Stamping Fee</td><td>Fixed Statutory Charge</td><td>&#8377;${procFee.toLocaleString('en-IN')}</td></tr>
                <tr style="background-color:#FFFFCC; font-weight:bold;"><td>TOTAL PAYABLE AMOUNT</td><td>Final Consideration</td><td><strong style="color:#800000; font-size:14px;">&#8377;${grandTotal.toLocaleString('en-IN')}</strong></td></tr>
            </table>
        `;

        openModal('checkout');
    } catch (err) {
        showAlert(err.message);
    }
}

async function executeTransaction() {
    const propId = document.getElementById('checkoutPropId').value;
    const paymentMethod = document.getElementById('checkoutPaymentMethod').value;

    try {
        const res = await fetch(`${API_BASE}/transactions/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ property_id: parseInt(propId), payment_method: paymentMethod })
        });
        const tx = await res.json();
        if (!res.ok) throw new Error(tx.detail || "Transaction execution failed.");

        closeModal();
        renderDeed(tx);
        openModal('deed');
        loadBuyerDashboard();
    } catch (err) {
        showModalAlert('checkoutAlert', err.message);
    }
}

// ===== DIGITAL E-DEED CERTIFICATE RENDERER =====
function renderDeed(tx) {
    const p = tx.property;
    const buyer = tx.buyer;
    const agent = tx.agent;
    const isBuy = tx.transaction_type === 'BUY';

    const html = `
        <div class="deed-watermark">INDIAN E-STAMPING</div>
        <div class="deed-header">
            <h2>GOVERNMENT OF INDIA &bull; DEPARTMENT OF REVENUE</h2>
            <h4>CERTIFICATE OF PROPERTY ${isBuy ? 'TITLE DEED & CONVEYANCE' : 'LEASE AGREEMENT'}</h4>
            <div style="font-size:10px; margin-top:4px; font-weight:bold; color:#800000;">STAMP DUTY PAID UNDER INDIAN STAMP ACT, 1899</div>
        </div>

        <div class="deed-stamp-box">
            <div>
                <strong>Certificate No:</strong> <span style="font-family:monospace; font-size:13px; color:#003366;">${tx.deed_number || ('DEED-2026-' + tx.id)}</span><br>
                <strong>Date &amp; Time:</strong> ${new Date(tx.transaction_time).toLocaleString('en-IN')}
            </div>
            <div style="text-align:right;">
                <strong>Stamp Duty Amount:</strong> &#8377;${(tx.stamp_duty || 0).toLocaleString('en-IN')}<br>
                <strong>Payment Mode:</strong> ${tx.payment_method || 'Net Banking'}
            </div>
        </div>

        <p style="line-height:1.6; text-align:justify;">
            THIS DEED OF ${isBuy ? 'CONVEYANCE' : 'LEASE'} is executed on this day by and between 
            <strong>${agent.agency_name}</strong> (representing Seller/Landlord, Contact: ${agent.contact_info}), 
            hereinafter called the FIRST PARTY, and 
            <strong>${buyer.name}</strong> (Email: ${buyer.email}), hereinafter called the SECOND PARTY.
        </p>

        <table class="deed-table">
            <tr><th>Property ID</th><td>#${p.id}</td></tr>
            <tr><th>Location &amp; Address</th><td>${p.address}, ${p.city}</td></tr>
            <tr><th>Specifications</th><td>${p.bhk || 2} BHK &bull; ${p.sqft || 1200} Sq. Ft. &bull; Verified Title</td></tr>
            <tr><th>Consideration Amount</th><td>&#8377;${tx.price.toLocaleString('en-IN')}</td></tr>
            <tr><th>Total Stamp Duty &amp; Taxes</th><td>&#8377;${((tx.stamp_duty || 0) + (tx.registration_fee || 0)).toLocaleString('en-IN')}</td></tr>
            <tr><th>Grand Total Paid</th><td><strong style="color:#800000;">&#8377;${(tx.total_amount || tx.price).toLocaleString('en-IN')}</strong></td></tr>
        </table>

        <p style="font-size:11px; font-style:italic;">
            The First Party hereby transfers complete statutory ${isBuy ? 'ownership and title' : 'leasehold rights'} of the aforementioned property to the Second Party. This digital deed is legally binding and registered in the National Real Estate Ledger.
        </p>

        <div class="deed-signatures">
            <div class="deed-sig-box">
                <div>[Digitally Signed]</div>
                <div>${agent.agency_name}</div>
                <div>(First Party - Transferor)</div>
            </div>
            <div class="deed-sig-box">
                <div>[Digitally Signed]</div>
                <div>${buyer.name}</div>
                <div>(Second Party - Transferee)</div>
            </div>
            <div class="deed-sig-box">
                <div>[E-SEALED BY PORTAL]</div>
                <div>Registrar of Properties</div>
                <div>Govt of India</div>
            </div>
        </div>
    `;

    document.getElementById('deedDocument').innerHTML = html;
}

async function viewDeed(txId) {
    try {
        const res = await fetch(`${API_BASE}/transactions/${txId}`);
        if (!res.ok) throw new Error("Deed record unavailable.");
        const tx = await res.json();
        renderDeed(tx);
        openModal('deed');
    } catch (err) {
        showAlert(err.message);
    }
}

// ===== BUYER FUNCTIONS =====
async function loadBuyerDashboard() {
    handleSearch(null);
    try {
        const res = await fetch(`${API_BASE}/transactions/buyer/me`);
        const txs = await res.json();
        renderTransactionsTable(txs, 'buyerTransactions');
    } catch (err) {
        document.getElementById('buyerTransactions').innerText = "Error loading transactions.";
    }
}

async function handleSearch(e) {
    if (e) e.preventDefault();
    const city = document.getElementById('searchCity').value;
    const type = document.getElementById('searchType').value;
    const bhk = document.getElementById('searchBhk').value;
    const minSqft = document.getElementById('searchMinSqft').value;
    const maxP = document.getElementById('searchMaxPrice').value;

    let q = new URLSearchParams();
    if (city) q.append('city', city);
    if (type) q.append('rent_or_buy', type);
    if (bhk) q.append('bhk', bhk);
    if (minSqft) q.append('min_sqft', minSqft);
    if (maxP) q.append('max_price', maxP);

    const resultsEl = document.getElementById('buyerSearchResults');
    resultsEl.innerHTML = '<em>Searching verified listings...</em>';

    try {
        const res = await fetch(`${API_BASE}/properties/?${q.toString()}`);
        const props = await res.json();

        if (props.length === 0) {
            resultsEl.innerHTML = '<p><em>No properties found matching your search criteria.</em></p>';
            return;
        }

        let html = '<table class="data-table"><tr><th>Photo</th><th>City</th><th>Address</th><th>BHK &amp; Area</th><th>Type</th><th>Price (&#8377;)</th><th>Agency</th><th>Action</th></tr>';
        props.forEach(p => {
            const imgSrc = p.photo_url ? p.photo_url : '/no_image.jpg';
            html += `<tr>
                <td><img src="${imgSrc}" width="65" style="border:1px solid #003366; display:block; cursor:pointer;" onclick="viewPropertyDetails(${p.id})"></td>
                <td><strong>${p.city}</strong></td>
                <td><a href="#" onclick="viewPropertyDetails(${p.id}); return false;">${p.address}</a></td>
                <td><span class="badge-bhk">${p.bhk || 2} BHK</span><br><span class="badge-sqft">${p.sqft || 1200} sq ft</span></td>
                <td>${p.rent_or_buy === 'RENT' ? 'For Rent' : 'For Sale'}</td>
                <td><strong>&#8377;${p.price.toLocaleString('en-IN')}</strong></td>
                <td>${p.agent.agency_name}</td>
                <td>
                    <button onclick="viewPropertyDetails(${p.id})">Inspect</button>
                    <button onclick="startCheckout(${p.id})" style="background-color:#006600; color:#fff; border-color:#004400;">Transact &raquo;</button>
                </td>
            </tr>`;
        });
        html += '</table>';
        resultsEl.innerHTML = html;
    } catch (err) {
        resultsEl.innerText = "Error searching properties.";
    }
}

// ===== SELLER FUNCTIONS =====
async function loadSellerDashboard() {
    try {
        const resP = await fetch(`${API_BASE}/properties/seller/me`);
        const props = await resP.json();

        let html = '<table class="data-table"><tr><th>ID</th><th>City</th><th>Address</th><th>BHK &amp; Area</th><th>Type</th><th>Price</th><th>Status</th><th>Actions</th></tr>';
        if (props.length === 0) {
            html += '<tr><td colspan="8"><em>No listings found. Add your first property above.</em></td></tr>';
        } else {
            props.forEach(p => {
                html += `<tr>
                    <td>${p.id}</td>
                    <td>${p.city}</td>
                    <td>${p.address}</td>
                    <td>${p.bhk || 2} BHK (${p.sqft || 1200} sq ft)</td>
                    <td>${p.rent_or_buy}</td>
                    <td>&#8377;${p.price.toLocaleString('en-IN')}</td>
                    <td><span style="color:${p.status === 'AVAILABLE' ? '#006600':'#800000'}; font-weight:bold;">${p.status}</span></td>
                    <td>
                        <button onclick="viewPropertyDetails(${p.id})">View</button>
                        <button onclick="openEditModal(${p.id}, ${p.price}, '${p.status}')">Edit</button>
                    </td>
                </tr>`;
            });
        }
        html += '</table>';
        document.getElementById('sellerProperties').innerHTML = html;

        const resT = await fetch(`${API_BASE}/transactions/seller/me`);
        const txs = await resT.json();
        renderTransactionsTable(txs, 'sellerTransactions');
    } catch (err) {
        showAlert("Error loading seller data.");
    }
}

async function handleAddProperty(e) {
    e.preventDefault();

    const selectedAmenities = [];
    document.querySelectorAll('.amenity-chk:checked').forEach(c => selectedAmenities.push(c.value));

    const payload = {
        city: document.getElementById('prop-city').value,
        address: document.getElementById('prop-address').value,
        rent_or_buy: document.getElementById('prop-type').value,
        bhk: parseInt(document.getElementById('prop-bhk').value),
        sqft: parseFloat(document.getElementById('prop-sqft').value),
        price: parseFloat(document.getElementById('prop-price').value),
        amenities: selectedAmenities.join(', '),
        remarks: document.getElementById('prop-remarks').value
    };

    try {
        const res = await fetch(`${API_BASE}/properties/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || "Failed to add property.");
        }
        const newProp = await res.json();

        const photoInput = document.getElementById('prop-photo');
        const videoInput = document.getElementById('prop-video');
        if (photoInput.files.length > 0 || videoInput.files.length > 0) {
            const formData = new FormData();
            if (photoInput.files.length > 0) formData.append('photo', photoInput.files[0]);
            if (videoInput.files.length > 0) formData.append('video', videoInput.files[0]);

            const mediaRes = await fetch(`${API_BASE}/properties/${newProp.id}/media`, {
                method: 'POST',
                body: formData
            });
            if (!mediaRes.ok) throw new Error("Property added, but media upload failed.");
        }

        showAlert("Listing added successfully!", false);
        document.getElementById('create-property-form').reset();
        loadSellerDashboard();
    } catch (err) {
        showAlert(err.message);
    }
}

function openEditModal(id, price, status) {
    document.getElementById('editPropId').value = id;
    document.getElementById('editPrice').value = price;
    document.getElementById('editStatus').value = status;
    document.getElementById('editAlert').classList.add('hidden');
    openModal('editProperty');
}

async function submitEditProperty(e) {
    e.preventDefault();
    const id = document.getElementById('editPropId').value;
    const newPrice = document.getElementById('editPrice').value;
    const newStatus = document.getElementById('editStatus').value;

    const payload = {};
    if (newPrice) payload.price = parseFloat(newPrice);
    if (newStatus) payload.status = newStatus;

    if (Object.keys(payload).length === 0) {
        showModalAlert('editAlert', 'No changes made.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/properties/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Update failed.");
        closeModal();
        showAlert("Listing updated successfully.", false);
        loadSellerDashboard();
    } catch (err) {
        showModalAlert('editAlert', err.message);
    }
}

// ===== ADMIN FUNCTIONS =====
async function loadAdminDashboard() {
    try {
        const sRes = await fetch(`${API_BASE}/admin/stats`);
        const stats = await sRes.json();
        document.getElementById('adminStats').innerHTML = `
            <table class="data-table" style="width:auto;">
                <tr><th>Metric</th><th>Value</th></tr>
                <tr><td>Total Listings</td><td>${stats.total_listings}</td></tr>
                <tr><td>Active</td><td>${stats.active_listings}</td></tr>
                <tr><td>Sold</td><td>${stats.sold_listings}</td></tr>
                <tr><td>Rented</td><td>${stats.rented_listings}</td></tr>
                <tr><td>Transactions</td><td>${stats.total_transactions}</td></tr>
            </table>`;

        const uRes = await fetch(`${API_BASE}/admin/users`);
        const users = await uRes.json();
        let uHtml = '<table class="data-table"><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Registered</th></tr>';
        users.forEach(u => {
            uHtml += `<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${new Date(u.created_at).toLocaleDateString('en-IN')}</td></tr>`;
        });
        uHtml += '</table>';
        document.getElementById('adminUsers').innerHTML = uHtml;

        const tRes = await fetch(`${API_BASE}/admin/transactions`);
        const txs = await tRes.json();
        renderTransactionsTable(txs, 'adminAllTransactions');
    } catch (err) {
        showAlert("Failed to load admin dashboard.");
    }
}

function downloadCSV() {
    window.location.href = `${API_BASE}/admin/transactions/export/csv`;
}

// ===== UTILITIES =====
function renderTransactionsTable(txs, targetId) {
    let html = '<table class="data-table"><tr><th>Tx ID</th><th>Deed No.</th><th>Date</th><th>City</th><th>Type</th><th>Total Paid</th><th>Deed</th></tr>';
    if (txs.length === 0) {
        html += '<tr><td colspan="7"><em>No transaction deeds executed yet.</em></td></tr>';
    } else {
        txs.forEach(t => {
            html += `<tr>
                <td>${t.id}</td>
                <td><code style="font-size:11px; font-weight:bold; color:#003366;">${t.deed_number || ('DEED-2026-' + t.id)}</code></td>
                <td>${new Date(t.transaction_time).toLocaleString('en-IN')}</td>
                <td>${t.property.city}</td>
                <td>${t.transaction_type}</td>
                <td><strong>&#8377;${(t.total_amount || t.price).toLocaleString('en-IN')}</strong></td>
                <td><button onclick="viewDeed(${t.id})" style="background-color:#FFFEEA; border-color:#800000; color:#800000;">&#128220; View Title Deed</button></td>
            </tr>`;
        });
    }
    html += '</table>';
    document.getElementById(targetId).innerHTML = html;
}

// ===== INIT =====
window.onload = () => {
    checkSession();

    const createForm = document.getElementById('create-property-form');
    if (createForm) {
        createForm.addEventListener('submit', handleAddProperty);
    }
};
