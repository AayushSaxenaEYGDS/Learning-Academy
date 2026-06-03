// Data
let currentItemType = '';
const topicDetails = {};
let pillars = [];

let topics = [];

// Static Chat Responses
const chatResponses = {
    'ai': 'Great question! Our AI/ML & Agents pillar covers intelligent systems and agentic AI workflows. Would you like to explore the AI learning topics?',
    'etl': 'ETL is crucial for data management! This pillar covers extraction, transformation, and loading of data across enterprise systems.',
    'validation': 'Data validation ensures quality and integrity. Check out our Validation pillar for comprehensive guidance.',
    'btq': 'Business Technology & Quality helps you transform operations. Explore our BTQ pillar for more information.',
    'learning': 'Welcome to Pfizer Learning Academy! We offer 4 business pillars with 16 topics designed by subject matter experts.',
    'pillar': 'We have 4 main business pillars: AI/ML & Agents, ETL, Validation, and BTQ. Would you like to learn more about any of them?',
    'topic': 'Each pillar contains multiple topics covering different aspects. You can explore them by clicking on any pillar card.',
    'help': 'I can help you explore our learning pillars and topics. Try asking about AI, ETL, Validation, or BTQ!',
    'default': 'That\'s an interesting question! I\'m your Pfizer Learning Assistant. Feel free to ask me about our learning pillars, topics, or how to get started.'
};


function openChatFromSearch() {
    document.getElementById('chatInterface').style.display = 'block';
    document.getElementById('chatSearchContainer').style.display = 'none';
    const input = document.getElementById('chatInputField');
    if (input) {
        setTimeout(() => input.focus(), 100);
    }
}

// Initialize app
// Determine backend API base URL. Defaults to localhost:8000 but avoids double-prefix
const API_BASE = (function(){
    if (location.protocol === 'file:') return 'http://127.0.0.1:8000';
    // If the frontend is already being served from the backend port, use relative paths
    if (location.hostname === '127.0.0.1' && (location.port === '8000' || location.port === '')) return '';
    // Default to backend on 127.0.0.1:8000 for local development
    return 'https://learning-academy-ve21.onrender.com';
})();

async function loadRemoteContent() {
    try {
        const res = await fetch(`${API_BASE}/api/content`);

        if (!res.ok) {
            throw new Error('Failed to fetch remote content');
        }

        const remote = await res.json();

        pillars = Array.isArray(remote.pillars)
            ? [...remote.pillars]
            : [];

        topics = Array.isArray(remote.topics)
            ? [...remote.topics]
            : [];
    }
    catch (err) {
        console.warn('Could not load remote content:', err);
        showBackendWarning();
    }
}

let backendAvailable = false;

// Local fallback storage so the app works by opening index.html directly.
const LOCAL_KEY = 'pla_local_content_v1';

function loadLocalContent() {
    try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (!raw) return { pillars: [], topics: [] };
        return JSON.parse(raw);
    } catch (e) {
        console.warn('Failed to parse local content', e);
        return { pillars: [], topics: [] };
    }
}

function saveLocalContent(data) {
    try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to save local content', e);
    }
}

async function syncLocalToBackend() {
    if (!backendAvailable) return;
    const local = loadLocalContent();
    if ((!local.pillars || local.pillars.length === 0) && (!local.topics || local.topics.length === 0)) return;

    // Try to push pillars first
    const remaining = { pillars: [], topics: [] };
    for (const p of local.pillars || []) {
        try {
            const res = await fetch(`${API_BASE}/api/add-pillar`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p)
            });
            if (!res.ok) {
                remaining.pillars.push(p);
            }
        } catch (e) {
            remaining.pillars.push(p);
        }
    }

    // Then topics
    for (const t of local.topics || []) {
        try {
            const res = await fetch(`${API_BASE}/api/add-topic`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t)
            });
            if (!res.ok) {
                remaining.topics.push(t);
            }
        } catch (e) {
            remaining.topics.push(t);
        }
    }

    saveLocalContent(remaining);
    if ((remaining.pillars.length === 0) && (remaining.topics.length === 0)) {
        // If everything synced, reload remote content to reflect authoritative state
        await loadRemoteContent();
        renderPillars();
    }
}

async function checkBackendHealth() {
    try {
        const res = await fetch(`${API_BASE}/health`);
        if (!res.ok) throw new Error('Health check failed');
        const info = await res.json();
        backendAvailable = true;
        removeBackendWarning();
        console.info('Backend health:', info);
        return info;
    } catch (err) {
        backendAvailable = false;
        console.warn('Backend health check failed:', err);
        showBackendWarning();
        return null;
    }
}

function showBackendWarning() {
    if (document.getElementById('backendWarning')) return;
    const warn = document.createElement('div');
    warn.id = 'backendWarning';
    warn.style.position = 'fixed';
    warn.style.top = '12px';
    warn.style.right = '12px';
    warn.style.background = '#f8d7da';
    warn.style.color = '#721c24';
    warn.style.border = '1px solid #f5c6cb';
    warn.style.padding = '12px 16px';
    warn.style.borderRadius = '6px';
    warn.style.zIndex = 9999;
    warn.textContent = 'Backend unreachable. Start the backend: python backend\\backend.py';
    document.body.appendChild(warn);
}

function removeBackendWarning() {
    const el = document.getElementById('backendWarning');
    if (el) el.remove();
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadRemoteContent();
    await checkBackendHealth();
    renderPillars();

    const aiPartnerSection = document.getElementById('aiLearningPartner');
    if (window.location.hash === '#aiLearningPartner' && aiPartnerSection) {
        aiPartnerSection.scrollIntoView({ behavior: 'smooth' });
    }
});

// Render Pillar Cards
function renderPillars() {
    const grid = document.getElementById('pillarsGrid');
    grid.innerHTML = '';

    // Render existing pillars
    pillars.forEach(pillar => {
        const card = createPillarCard(pillar);
        grid.appendChild(card);
    });

    // Render add pillar card
    const addCard = createAddPillarCard();
    grid.appendChild(addCard);
}

function createPillarCard(pillar) {
    const card = document.createElement('div');
    card.className = 'pillarCard';

    const header = document.createElement('div');
    header.className = 'pillarCardHeader';

    const title = document.createElement('h3');
    title.className = 'pillarCardTitle';
    title.textContent = pillar.title;

    const description = document.createElement('p');
    description.className = 'pillarCardDescription';
    description.textContent = pillar.description;

    header.appendChild(title);
    header.appendChild(description);

    const footer = document.createElement('div');
    footer.className = 'pillarCardFooter';

    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '→';

    footer.appendChild(arrow);

    const smeSection = document.createElement('div');
    smeSection.className = 'pillarCardSME';
    smeSection.innerHTML = `<small>SME: ${escapeHtml(pillar.smeName)}</small>`;

    card.appendChild(header);
    card.appendChild(smeSection);
    card.appendChild(footer);

    card.addEventListener('click', () => {
        showPillarDetail(pillar);
    });

    return card;
}

function createAddPillarCard() {
    const card = document.createElement('div');
    card.className = 'pillarCard';
    card.setAttribute('data-add', 'true');

    const content = document.createElement('div');
    content.className = 'addContent';

    const icon = document.createElement('span');
    icon.className = 'addIcon';
    icon.textContent = '+';

    const text = document.createElement('p');
    text.textContent = 'Add Pillar';

    content.appendChild(icon);
    content.appendChild(text);
    card.appendChild(content);

    card.addEventListener('click', () => {
        openAddPillarModal();
    });

    return card;
}

function dismissAddInfo() {
    const addInfo = document.getElementById('addPillarInfo');
    addInfo.style.display = 'none';
}

// Pillar Detail Page Functions
let currentPillar = null;
let currentTopic = null;

function showPillarDetail(pillar) {
    currentPillar = pillar;
    // Hide main content
    document.querySelector('.main').style.display = 'none';
    
    // Show detail page
    const detailPage = document.getElementById('pillarDetailPage');
    detailPage.style.display = 'block';

    // Populate detail content
    document.getElementById('detailPillarTitle').textContent = pillar.title;

    const deleteBtn = document.getElementById('deletePillarBtn');

    if (deleteBtn) {

        deleteBtn.style.display = 'block';

        deleteBtn.onclick = () => {deletePillar(pillar.id);};
    }
    
    // Populate SME Card
    const smeCard = document.getElementById('detailSMECard');
    smeCard.innerHTML = `
        <div class="smeCardContent">
            <h3>Subject Matter Expert</h3>
            <p class="smeName">${escapeHtml(pillar.smeName)}</p>
            <p class="smeRole">${escapeHtml(pillar.smeRole)}</p>
            <p class="smeEmail"><a href="mailto:${pillar.smeEmail}">${pillar.smeEmail}</a></p>
        </div>
    `;

    // Populate Topics with clickable items
    const topicsList = document.getElementById('detailTopics');

    topicsList.innerHTML = `
        <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:20px;
        ">
            <h2>Topics</h2>

            <button
               class="addTopicBtn"
                onclick="openAddItemModal('topic')"
            >
            + Add Topic
            </button>
        </div>

    <div class="topicsGrid">
    ${pillar.topics.map((topic, idx) => {

    const topicObj =
        typeof topic === 'string'
        ? {
            title: topic,
            description: 'Detailed SME-driven learning content'
        }
        : topic;

    return `
        <div
            class="topicCard"
            onclick="showItemDetail(
                'topic',
                '${pillar.id}',
                ${idx},
                '${topicObj.title}'
            )"
        >
            <h3>${topicObj.title}</h3>

            <p>${topicObj.description}</p>
        </div>
    `;

}).join('')}
</div>
`;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBackHome() {
    // Hide detail page
    document.getElementById('pillarDetailPage').style.display = 'none';
    
    // Show main content
    document.querySelector('.main').style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Item Detail Page Functions
let itemDetailData = {
    type: null,
    pillarId: null,
    index: null,
    title: null
};

function showItemDetail(type, pillarId, index, title) {
    itemDetailData = { type, pillarId, index, title };
    currentTopic = { type, pillarId, index, title };

    // Hide pillar detail page
    document.getElementById('pillarDetailPage').style.display = 'none';
    
    // Show item detail page
    const itemDetailPage = document.getElementById('itemDetailPage');
    itemDetailPage.style.display = 'block';

    // Populate item detail
    document.getElementById('itemDetailTitle').textContent = title;
    const deleteTopicBtn = document.getElementById('deleteTopicBtn');

    if (deleteTopicBtn) {
        deleteTopicBtn.style.display = 'block';
        deleteTopicBtn.onclick = () => {
            const pillar = pillars.find(
                p => p.id === pillarId
            );

            if (!pillar) return;

            const topic = pillar.topics[index];

            const topicId = typeof topic === 'object'? topic.id: title.toLowerCase().replace(/\s+/g, '-');

            deleteTopic(topicId);
        };
    }
    
    // Generate sample content based on type and title
    const keyPoints = getItemKeyPoints(type, title);
    let content = getItemContent(type, title);

    if (type === 'topic') {

    const pillar =
        pillars.find(p => p.id === pillarId);

    if (pillar && pillar.topics[index]) {

        const topic = pillar.topics[index];

        if (typeof topic === 'object') {

            content = topic.content;

        }
    }
}

    const keyPointsList = document.getElementById('itemDetailKeyPoints');
    keyPointsList.innerHTML = `<p>${keyPoints.join(' ')}</p>`;

    document.getElementById('contentParagraph').textContent = content;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBackToPillarDetail() {
    // Hide item detail page
    document.getElementById('itemDetailPage').style.display = 'none';
    
    // Show pillar detail page
    document.getElementById('pillarDetailPage').style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getItemDescription(type, title) {
    const descriptions = {
        'topic': `${title} is a comprehensive learning module designed to build expertise in this area. This content covers fundamental concepts, best practices, and real-world applications.`,
        'sop': `${title} outlines the standard procedures and guidelines for implementing this process. It provides step-by-step instructions, quality checkpoints, and compliance requirements.`,
        'material': `${title} is a comprehensive resource document that contains detailed information, templates, checklists, and reference materials for this domain.`
    };
    return descriptions[type] || 'Detailed content for this item';
}

function getItemKeyPoints(type, title) {
    const keyPoints = {
        'topic': [
            'Fundamental concepts and definitions',
            'Industry best practices and standards',
            'Practical implementation strategies',
            'Common challenges and solutions',
            'Performance metrics and KPIs'
        ],
        'sop': [
            'Process overview and objectives',
            'Stakeholder roles and responsibilities',
            'Step-by-step procedure documentation',
            'Quality assurance checkpoints',
            'Exception handling and escalation paths'
        ],
        'material': [
            'Executive summary and overview',
            'Detailed reference materials',
            'Templates and checklists',
            'Case studies and examples',
            'Supporting documentation and links'
        ]
    };
    return keyPoints[type] || [];
}

function getItemContent(type, title) {
    return `This is the detailed content for ${title}. In a real implementation, this would contain:\n\n1. Comprehensive overview of the topic/procedure/material\n2. Step-by-step instructions or guidance\n3. Important considerations and best practices\n4. Real-world examples and case studies\n5. Links to related resources and references\n6. Implementation timeline and milestones\n7. Success metrics and KPIs for tracking progress\n8. Support and escalation procedures`;
}

function getItemResources(type, title) {
    const resources = {
        'topic': [
            'Video Tutorial: Getting Started with ' + title,
            'Interactive Quiz: Test Your Knowledge',
            'Case Study: Real-world Application',
            'Reference Document: Complete Guide',
            'FAQ: Frequently Asked Questions'
        ],
        'sop': [
            'Process Flow Diagram',
            'Step-by-step Procedure Document',
            'Quality Checklist',
            'Risk Assessment Matrix',
            'Training Presentation'
        ],
        'material': [
            'Implementation Handbook',
            'Template Repository',
            'Reference Guides',
            'Training Slides',
            'Video Demonstrations'
        ]
    };
    return resources[type] || [];
}

// Add Item Modal Functions
function openAddItemModal(itemType) {
    const modal = document.getElementById('addItemModal');
    const overlay = document.getElementById('modalOverlay');
    const title = document.getElementById('addItemModalTitle');

    const typeLabels = {
        'topic': 'Add New Topic',
        'sop': 'Add New SOP',
        'material': 'Add New Material'
    };

    title.textContent = typeLabels[itemType] || 'Add New Item';
    modal.setAttribute('data-item-type', itemType);
    modal.style.display = 'flex';
    overlay.style.display = 'block';
}

function closeAddItemModal() {
    const modal = document.getElementById('addItemModal');
    const overlay = document.getElementById('modalOverlay');
    modal.style.display = 'none';
    overlay.style.display = 'none';
    document.getElementById('addItemForm').reset();
}

async function submitAddItem(event) {

    event.preventDefault();

    const itemName = document.getElementById('itemName').value.trim();
    const itemDescription = document.getElementById('itemDescription').value.trim();
    const itemContent = document.getElementById('itemContent').value.trim();

    if (!itemName || !itemDescription || !itemContent) {
        alert('Please fill all fields');
        return;
    }

    const itemType = document.getElementById('addItemModal').getAttribute('data-item-type');

    if (itemType === 'topic') {
        if (!backendAvailable) {
            // Save locally so the app works without a backend server
            const local = loadLocalContent();
            local.topics = local.topics || [];
            local.topics.push(newTopic);
            saveLocalContent(local);

            // Update UI immediately
            currentPillar.topics.push(newTopic);
            topics.push({ id: newTopic.id, title: newTopic.title, pillarId: newTopic.pillarId, description: newTopic.description, content: newTopic.content });
            closeAddItemModal();
            showPillarDetail(currentPillar);
            alert(`${itemName} created locally (no backend). It will sync when the backend is available.`);
            return;
        }
        const newTopic = {
            id: itemName.toLowerCase().replace(/\s+/g, '-'),
            title: itemName,
            pillarId: currentPillar.id,
            description: itemDescription,
            content: itemContent
        };

        try {
            const res = await fetch(`${API_BASE}/api/add-topic`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTopic)
            });

            if (!res.ok) {
                let bodyText = '';
                try {
                    const json = await res.json();
                    bodyText = json.error || JSON.stringify(json);
                } catch (e) {
                    bodyText = await res.text().catch(() => res.statusText || '');
                }
                console.error('Add-topic failed', res.status, bodyText);
                alert(`Failed to save topic: ${res.status} ${bodyText}`);
                return;
            }

            // Update UI after backend confirms; re-sync from backend
            await loadRemoteContent();
            closeAddItemModal();
            // Find updated pillar reference
            const updated = pillars.find(p => p.id === currentPillar.id) || currentPillar;
            showPillarDetail(updated);
            alert(`${itemName} created successfully.`);
            // Attempt to sync any local content remaining
            await syncLocalToBackend();
        } catch (err) {
            console.error(err);
            alert('Failed to save topic to backend. See console for details.');
        }
    }
}
    

// Add Pillar Modal Functions
function openAddPillarModal() {
    const modal = document.getElementById('addPillarModal');
    const overlay = document.getElementById('pillarModalOverlay');
    modal.style.display = 'flex';
    overlay.style.display = 'block';
}

function closeAddPillarModal() {
    const modal = document.getElementById('addPillarModal');
    const overlay = document.getElementById('pillarModalOverlay');
    modal.style.display = 'none';
    overlay.style.display = 'none';
    document.getElementById('addPillarForm').reset();
}

async function submitAddPillar(event) {

    event.preventDefault();

    const pillarName = document.getElementById('pillarName').value.trim();
    const smeName = document.getElementById('smeName').value.trim();
    const smePosition = document.getElementById('smePosition').value.trim();
    const smeEmail = document.getElementById('smeEmail').value.trim();

    if (!pillarName || !smeName || !smePosition || !smeEmail) {
        alert('Please fill all required fields');
        return;
    }

    const newPillar = {
        id: pillarName.toLowerCase().replace(/\s+/g, '-'),
        title: pillarName,
        description: `${pillarName} enterprise learning and capability pillar.`,
        smeName: smeName,
        smeEmail: smeEmail,
        smeRole: smePosition,
        topics: [],
        sops: [],
        materials: []
    };

    try {
        if (!backendAvailable) {
            // Save locally so the app works without a backend server
            const local = loadLocalContent();
            local.pillars = local.pillars || [];
            local.pillars.push(newPillar);
            saveLocalContent(local);

            // Update UI immediately
            pillars.push(newPillar);
            closeAddPillarModal();
            renderPillars();
            alert(`${pillarName} created locally (no backend). It will sync when the backend is available.`);
            return;
        }

        const res = await fetch(`${API_BASE}/api/add-pillar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPillar)
        });

        if (!res.ok) {
            let bodyText = '';
            try {
                const json = await res.json();
                bodyText = json.error || JSON.stringify(json);
            } catch (e) {
                bodyText = await res.text().catch(() => res.statusText || '');
            }
            console.error('Add-pillar failed', res.status, bodyText);
            alert(`Failed to save pillar: ${res.status} ${bodyText}`);
            return;
        }

        // Re-sync from backend and re-render
        await loadRemoteContent();
        closeAddPillarModal();
        renderPillars();
        alert(`${pillarName} pillar created successfully.`);
        // Attempt to sync any local content remaining
        await syncLocalToBackend();
    } catch (err) {
        console.error(err);
        alert('Failed to save pillar to backend. See console for details.');
    }
}

// Search functionality
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    const searchResults = document.getElementById('searchResults');

    if (query.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    // Search through pillars and topics
    const results = [
        ...pillars.filter(p => 
            p.title.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query)
        ).map(p => ({
            type: 'pillar',
            title: p.title,
            description: p.description,
            id: p.id
        })),
        ...topics.filter(t => 
            t.title.toLowerCase().includes(query) || 
            t.description.toLowerCase().includes(query)
        ).map(t => ({
            type: 'topic',
            title: t.title,
            description: t.description,
            id: t.id,
            pillarId: t.pillarId
        }))
    ];

    if (results.length === 0) {
        searchResults.style.display = 'none';
        return;
    }

    searchResults.innerHTML = results.map((result, index) => `
        <div class="searchResult" onclick="handleResultClick('${result.type}', '${result.id}')">
            <p class="searchResultTitle">${escapeHtml(result.title)}</p>
            <span class="searchResultType">${result.type}</span>
            <p class="searchResultDescription">${escapeHtml(result.description)}</p>
        </div>
    `).join('');

    searchResults.style.display = 'block';
}

function handleResultClick(type, id) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    document.getElementById('searchResults').style.display = 'none';
    alert(`You clicked on: ${type} - ${id}`);
}

// Chat functionality
function openChat() {
    const chatInterface = document.getElementById('chatInterface');
    const searchContainer = document.querySelector('.searchContainer');
    chatInterface.style.display = 'block';
    document.getElementById('chatInputField').focus();
}

function closeChat() {
    const chatInterface = document.getElementById('chatInterface');
    const searchContainer = document.querySelector('.searchContainer');
    chatInterface.style.display = 'none';
    searchContainer.style.display = 'block';
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}


async function sendChatMessage() {
    const inputField = document.getElementById('chatInputField');
    const message = inputField.value.trim();

    if (message.length === 0) return;

    addChatMessage(message, 'user');
    inputField.value = '';
    inputField.focus();

    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();
        addChatMessage(data.message || 'No response received.', 'bot');

    } catch (error) {
        addChatMessage('Backend connection failed. Please ensure backend is running.', 'bot');
    }
}


function addChatMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatMessage ${sender}`;

    const p = document.createElement('p');
    p.textContent = text;

    messageDiv.appendChild(p);
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getStaticResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Check for keywords
    for (const [keyword, response] of Object.entries(chatResponses)) {
        if (lowerMessage.includes(keyword)) {
            return response;
        }
    }

    return chatResponses['default'];
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function deletePillar(pillarId) {

    if (!confirm('Delete this pillar and all topics?')) {
        return;
    }

    try {
        const response =
            await fetch(
                `${API_BASE}/api/delete-pillar/${pillarId}`,
                {
                    method: 'DELETE'
                }
            );

        if (!response.ok) {
            throw new Error();
        }

        const index =
            pillars.findIndex(
                p => p.id === pillarId
            );

        if (index > -1) {
            pillars.splice(index, 1);
        }

        goBackHome();
        renderPillars();
        alert('Pillar deleted');

    } catch (error) {

        console.error(error);
        alert(
            'Failed to delete pillar'
        );
    }
}

async function deleteTopic(topicId) {

    if (!confirm('Delete this topic?')) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE}/api/delete-topic/${topicId}`,
                {
                    method: 'DELETE'
                }
            );

        if (!response.ok) {
            throw new Error();
        }

        if (currentPillar) {

            currentPillar.topics =
                currentPillar.topics.filter(
                    topic => {

                        if (
                            typeof topic === 'object'
                        ) {
                            return topic.id !== topicId;
                        }

                        return true;
                    }
                );
        }

        goBackToPillarDetail();
        showPillarDetail(currentPillar);
        alert('Topic deleted');} 
    catch (error) {
        console.error(error);
        alert(
            'Failed to delete topic'
        );
    }
}

// --- AI Assessment / Quiz Logic (client-side templated MCQs) ---
let currentQuiz = [];
let currentQuizIndex = 0;
let currentScore = 0;

function startAssessment() {
    const topic = document.getElementById('assessmentTopicInput').value.trim();
    if (!topic) {
        alert('Please enter a topic for the assessment.');
        return;
    }

    generateAssessment(topic);
}


async function generateAssessment(topic) {

    const container = document.getElementById('assessmentContainer');

    container.style.display = 'block';

    container.innerHTML = `
        <div class="quizCard">
            <h3>Generating AI Assessment...</h3>
            <p>Please wait while AI creates questions.</p>
        </div>
    `;

    try {

        const response = await fetch(`${API_BASE}/assessment/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic: topic
            })
        });

        const data = await response.json();

        console.log("Assessment API Response:", data); 
        
        if (!data.success || !Array.isArray(data.questions)) { 
            throw new Error('Invalid assessment response'); }

        currentQuiz = data.questions.map(q => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correct
        }));

        currentQuizIndex = 0;
        currentScore = 0;

        renderQuiz();

    } catch (error) {

        container.innerHTML = `
            <div class="quizCard">
                <h3>Assessment Failed</h3>
                <p>Unable to generate AI assessment.</p>
            </div>
        `;
    }
}


function renderQuiz() {
    const container = document.getElementById('assessmentContainer');
    container.style.display = 'block';
    renderQuestion(currentQuizIndex);
}

function renderQuestion(index) {
    const q = currentQuiz[index];
    const container = document.getElementById('assessmentContainer');

    if (!q) return;

    container.innerHTML = `
        <div class="quizCard">
            <h3>Question ${index + 1} of ${currentQuiz.length}</h3>
            <p class="quizQuestion">${escapeHtml(q.question)}</p>
            <div class="quizOptions">
                ${q.options.map((opt, i) => `
                    <label class="quizOption">
                        <input type="radio" name="quizOption" value="${i}"> ${escapeHtml(opt)}
                    </label>
                `).join('')}
            </div>
            <div style="margin-top:12px;">
                <button onclick="submitAnswer()">${index === currentQuiz.length - 1 ? 'Finish' : 'Next'}</button>
                <button onclick="cancelAssessment()" style="margin-left:8px;">Cancel</button>
            </div>
        </div>
    `;
}

function submitAnswer() {
    const selected = document.querySelector('input[name="quizOption"]:checked');
    if (!selected) {
        alert('Please select an answer.');
        return;
    }

    const choice = parseInt(selected.value, 10);
    const q = currentQuiz[currentQuizIndex];
    if (choice === q.correctIndex) currentScore++;

    currentQuizIndex++;

    if (currentQuizIndex >= currentQuiz.length) {
        finishAssessment();
    } else {
        renderQuestion(currentQuizIndex);
    }
}

function finishAssessment() {
    const container = document.getElementById('assessmentContainer');
    container.innerHTML = `
        <div class="quizResults">
            <h3>Assessment Complete</h3>
            <p>Your score: <strong>${currentScore} / ${currentQuiz.length}</strong></p>
            <div style="margin-top:12px;">
                <button onclick="startAssessment()">Retake</button>
                <button onclick="closeAssessment()" style="margin-left:8px;">Close</button>
            </div>
        </div>
    `;
}

function cancelAssessment() {
    if (!confirm('Cancel the assessment?')) return;
    closeAssessment();
}

function closeAssessment() {
    const container = document.getElementById('assessmentContainer');
    container.style.display = 'none';
    container.innerHTML = '';
}

function scrollToSection(sectionId) {
    if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');

    if (!searchResults.contains(e.target) && !(searchInput && searchInput.contains(e.target))) {
        searchResults.style.display = 'none';
    }
});

// Close chat when pressing Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const chatInterface = document.getElementById('chatInterface');
        if (chatInterface.style.display === 'block') {
            closeChat();
        }
    }
});

// Merge any local content into in-memory arrays so UI reflects previously saved items
const _local = loadLocalContent();
if (_local && Array.isArray(_local.pillars)) {
    _local.pillars.forEach(lp => {
        if (!pillars.find(p => p.id === lp.id || p.title === lp.title)) pillars.push(lp);
    });
}
if (_local && Array.isArray(_local.topics)) {
    _local.topics.forEach(lt => {
        if (!topics.find(t => t.id === lt.id || t.title === lt.title)) topics.push(lt);
    });
}
