// ==========================================================
// CODE-BASED CONTENT STORAGE
// ==========================================================
// Add, edit, or remove pillars and topics here.
// This replaces browser localStorage.
//
// Important:
// Browser JavaScript cannot permanently write into app.js.
// UI-created items are added for the current session only.
// To make them permanent, copy the generated object from console
// into academyStore.pillars or academyStore.topics below.
// ==========================================================

const academyStore = {
    pillars: [
        {
            id: 'model-consulting',
            title: 'Model Consulting',
            description: '',
            objective: '',
            smeName: 'Avinash Kumar',
            smeEmail: 'avinash.kumar@pfizer.com',
            smeRole: 'Senior Risk Consulting',
            topics: [],
            sops: [
                'SOP-001: AI Model Development Framework',
                'SOP-002: Agent Workflow Configuration',
                'SOP-003: Model Validation and Testing',
                'SOP-004: Production Deployment Guidelines'
            ],
            materials: [
                'AI Implementation Handbook',
                'Agent Architecture Guide',
                'Model Validation Checklist',
                'Use Case Templates'
            ]
        },
        {
            id: 'etl',
            title: 'ETL',
            description: '',
            objective: '',
            smeName: 'Arjun Agarwal',
            smeEmail: 'arjun.agarwal@pfizer.com',
            smeRole: 'Senior Risk Consulting',
            topics: [],
            sops: [
                'SOP-101: ETL Pipeline Design',
                'SOP-102: Data Extraction Best Practices',
                'SOP-103: Transformation Logic Implementation',
                'SOP-104: Data Loading and Reconciliation'
            ],
            materials: [
                'ETL Process Guide',
                'Data Mapping Templates',
                'Error Handling Procedures',
                'Performance Optimization Guide'
            ]
        },
        {
            id: 'validation',
            title: 'Validation',
            description: '',
            objective: '',
            smeName: 'Aayush Saxena',
            smeEmail: 'aayush.saxena@pfizer.com',
            smeRole: 'Senior Risk Consulting',
            topics: [],
            sops: [
                'SOP-201: Validation Planning and Strategy',
                'SOP-202: Risk Assessment Framework',
                'SOP-203: Test Execution and Documentation',
                'SOP-204: Deviation Management and Closure'
            ],
            materials: [
                'Validation Master Plan Template',
                'Risk Assessment Matrix',
                'Test Script Template',
                'Evidence Collection Guide'
            ]
        },
        {
            id: 'btq',
            title: 'BTQ',
            description: '',
            objective: '',
            smeName: 'Aniruddha Desai',
            smeEmail: 'aniruddha.desai@pfizer.com',
            smeRole: 'Operations & Technology Lead',
            topics: [],
            sops: [
                'SOP-301: Quality Process Design',
                'SOP-302: Technology Integration Steps',
                'SOP-303: Quality Monitoring and Metrics',
                'SOP-304: Continuous Improvement Process'
            ],
            materials: [
                'Quality Management System Guide',
                'Process Improvement Toolkit',
                'Metrics Dashboard Guide',
                'Best Practices Compendium'
            ]
        }
    ],

    topics: [
        {
            id: 'intro-ai',
            title: 'Intro to AI',
            pillarId: 'model-consulting',
            description: 'Introduction to AI and Machine Learning concepts',
            content: 'This topic introduces foundational AI concepts including supervised and unsupervised learning, model evaluation, and common use-cases in enterprise settings. Learners will get an overview of typical architectures, data requirements, and ethical considerations specific to regulated environments.'
        },
        {
            id: 'sop-ai',
            title: 'AI SOPs',
            pillarId: 'model-consulting',
            description: 'Standard Operating Procedures for AI systems',
            content: 'This topic provides a practical set of SOPs for developing, testing and deploying AI systems at scale. It covers version control, model validation checkpoints, deployment gates, monitoring and rollback procedures.'
        },
        {
            id: 'ai-validation-checklist',
            title: 'AI Validation Checklist',
            pillarId: 'model-consulting',
            description: 'Checklist for AI validation activities',
            content: 'This topic covers validation checkpoints, governance expectations, testing requirements, and documentation needs for AI-enabled solutions.'
        },
        {
            id: 'ai-materials',
            title: 'AI Materials',
            pillarId: 'model-consulting',
            description: 'Reference materials for AI learning',
            content: 'Reference materials, templates, examples, and supporting documentation for AI and machine learning learning paths.'
        },
        {
            id: 'intro-etl',
            title: 'ETL Fundamentals',
            pillarId: 'etl',
            description: 'Understand the basics of ETL processes',
            content: 'Covers extraction strategies, transformation best practices, and loading patterns. Includes guidance on mapping, error handling, idempotency, and performance tuning for enterprise data pipelines.'
        },
        {
            id: 'sop-etl',
            title: 'ETL SOPs',
            pillarId: 'etl',
            description: 'Standard Operating Procedures for ETL',
            content: 'Standard procedures for executing and maintaining ETL processes, including scheduling, monitoring, data reconciliation and incident response steps.'
        },
        {
            id: 'etl-validation',
            title: 'ETL Validation',
            pillarId: 'etl',
            description: 'Validation approach for ETL pipelines',
            content: 'Covers reconciliation, transformation validation, source-to-target checks, exception handling, and documentation practices for ETL workflows.'
        },
        {
            id: 'etl-materials',
            title: 'ETL Materials',
            pillarId: 'etl',
            description: 'Reference materials for ETL learning',
            content: 'Reference guides, templates, mapping documents, and examples to support ETL learning and implementation.'
        },
        {
            id: 'intro-val',
            title: 'Validation Basics',
            pillarId: 'validation',
            description: 'Fundamentals of data validation',
            content: 'Introduces the principles of validation, test planning, evidence collection, and acceptance criteria. Suitable for teams responsible for ensuring data quality and regulatory compliance.'
        },
        {
            id: 'sop-val',
            title: 'Validation SOPs',
            pillarId: 'validation',
            description: 'Standard Operating Procedures for Validation',
            content: 'Provides step-by-step SOPs for planning, executing, documenting and closing validation activities. Includes templates for test cases and traceability documentation.'
        },
        {
            id: 'validation-checklist',
            title: 'Validation Checklist',
            pillarId: 'validation',
            description: 'Checklist for validation activities',
            content: 'A practical checklist covering planning, risk assessment, test execution, evidence capture, deviation handling, and closure.'
        },
        {
            id: 'validation-guide',
            title: 'Validation Guide',
            pillarId: 'validation',
            description: 'Implementation guide for validation',
            content: 'Detailed guidance for designing, executing, and documenting validation activities across business and technology processes.'
        },
        {
            id: 'intro-btq',
            title: 'BTQ Overview',
            pillarId: 'btq',
            description: 'Overview of Business Technology & Quality',
            content: 'An overview of how business, technology and quality functions intersect to deliver reliable operations. Topics include governance, metrics, and cross-functional collaboration.'
        },
        {
            id: 'sop-btq',
            title: 'BTQ SOPs',
            pillarId: 'btq',
            description: 'Standard Operating Procedures for BTQ',
            content: 'Practical SOPs for integrating technology and quality practices, including deployment readiness, change control and continuous improvement routines.'
        },
        {
            id: 'quality-assurance',
            title: 'Quality Assurance',
            pillarId: 'btq',
            description: 'Quality assurance practices for BTQ',
            content: 'Covers QA practices, review checkpoints, quality metrics, governance mechanisms, and continuous improvement methods.'
        },
        {
            id: 'technology-integration',
            title: 'Technology Integration',
            pillarId: 'btq',
            description: 'Technology integration under BTQ',
            content: 'Guidance on integrating technology with business and quality processes, including change management, readiness checks, and adoption planning.'
        }
    ]
};

const pillars = academyStore.pillars;
let topics = academyStore.topics;

// Static Chat Responses
const chatResponses = {
    model: 'Model Consulting covers AI, ML, model validation, model governance, and consulting support for intelligent enterprise solutions.',
    ai: 'Model Consulting covers AI, ML, model validation, and intelligent enterprise solutions. Would you like to explore the related learning topics?',
    etl: 'ETL is crucial for data management. This pillar covers extraction, transformation, and loading of data across enterprise systems.',
    validation: 'Data validation ensures quality and integrity. Check out our Validation pillar for comprehensive guidance.',
    btq: 'Business Technology & Quality helps transform operations. Explore our BTQ pillar for more information.',
    learning: 'Welcome to Pfizer Learning Academy. We offer learning pillars and topics designed by subject matter experts.',
    pillar: 'We have main business pillars such as Model Consulting, ETL, Validation, and BTQ. Would you like to learn more about any of them?',
    topic: 'Each pillar contains multiple topics covering different aspects. You can explore them by clicking on any pillar card.',
    help: 'I can help you explore our learning pillars and topics. Try asking about Model Consulting, ETL, Validation, or BTQ.',
    default: 'That\'s an interesting question. I\'m your Pfizer Learning Assistant. Feel free to ask me about our learning pillars, topics, or how to get started.'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderPillars();
});

// Render Pillar Cards
function renderPillars() {
    const grid = document.getElementById('pillarsGrid');
    grid.innerHTML = '';

    pillars.forEach(pillar => {
        const card = createPillarCard(pillar);
        grid.appendChild(card);
    });

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
    description.textContent = pillar.description || pillar.objective || '';

    header.appendChild(title);
    header.appendChild(description);

    const smeSection = document.createElement('div');
    smeSection.className = 'pillarCardSME';
    smeSection.innerHTML = `<small>SME: ${escapeHtml(pillar.smeName)}</small>`;

    const footer = document.createElement('div');
    footer.className = 'pillarCardFooter';

    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '→';

    footer.appendChild(arrow);

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

// Pillar Detail Page Functions
let currentPillar = null;

function showPillarDetail(pillar) {
    currentPillar = pillar;

    const main = document.querySelector('.main');
    if (main) main.style.display = 'none';

    const itemDetailPage = document.getElementById('itemDetailPage');
    if (itemDetailPage) {
        itemDetailPage.style.display = 'none';

        const itemTitleEl = document.getElementById('itemDetailTitle');
        if (itemTitleEl) itemTitleEl.textContent = '';

        const itemTitleHeading = document.getElementById('itemTitleHeading');
        if (itemTitleHeading) itemTitleHeading.textContent = '';

        const keyPointsList = document.getElementById('itemDetailKeyPoints');
        if (keyPointsList) keyPointsList.innerHTML = '';

        const contentPara = document.getElementById('contentParagraph');
        if (contentPara) contentPara.textContent = '';
    }

    const detailPage = document.getElementById('pillarDetailPage');
    if (detailPage) detailPage.style.display = 'block';

    document.getElementById('detailPillarTitle').textContent = pillar.title;

    const smeCard = document.getElementById('detailSMECard');
    smeCard.innerHTML = `
        <div class="smeCardContent">
            <h3>Subject Matter Expert</h3>
            <p class="smeName">${escapeHtml(pillar.smeName)}</p>
            <p class="smeRole">${escapeHtml(pillar.smeRole)}</p>
            <p class="smeEmail"><a href="mailto:${escapeAttribute(pillar.smeEmail)}">${escapeHtml(pillar.smeEmail)}</a></p>
        </div>
    `;

    const topicsList = document.getElementById('detailTopics');
    const pillarTopics = topics.filter(t => t.pillarId === pillar.id);

    topicsList.innerHTML = '';

    pillarTopics.forEach((topic, idx) => {
        const topicCard = document.createElement('div');
        topicCard.className = 'topicCard';
        topicCard.textContent = topic.title;
        topicCard.addEventListener('click', () => showItemDetail('topic', topic.id, idx, topic.title));
        topicsList.appendChild(topicCard);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBackHome() {
    document.getElementById('pillarDetailPage').style.display = 'none';
    document.querySelector('.main').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Item Detail Page Functions
let itemDetailData = {
    type: null,
    itemId: null,
    index: null,
    title: null
};

function showItemDetail(type, itemId, index, title) {
    itemDetailData = { type, itemId, index, title };

    const main = document.querySelector('.main');
    if (main) main.style.display = 'none';

    const pillarDetailPage = document.getElementById('pillarDetailPage');
    if (pillarDetailPage) pillarDetailPage.style.display = 'none';

    const itemDetailPage = document.getElementById('itemDetailPage');
    if (itemDetailPage) itemDetailPage.style.display = 'block';

    const itemDetailTitle = document.getElementById('itemDetailTitle');
    if (itemDetailTitle) itemDetailTitle.textContent = title;

    const itemTitleHeading = document.getElementById('itemTitleHeading');
    if (itemTitleHeading) itemTitleHeading.textContent = title;

    const keyPointsList = document.getElementById('itemDetailKeyPoints');
    if (keyPointsList) keyPointsList.innerHTML = '';

    const contentPara = document.getElementById('contentParagraph');

    if (type === 'topic') {
        const topic = topics.find(t => t.id === itemId);

        if (topic && contentPara) {
            contentPara.textContent = topic.content || topic.description || 'No content available';
        } else if (contentPara) {
            contentPara.textContent = 'Topic content not found';
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBackToPillarDetail() {
    document.getElementById('itemDetailPage').style.display = 'none';
    document.getElementById('pillarDetailPage').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add Item Modal Functions
function openAddItemModal(itemType) {
    const modal = document.getElementById('addItemModal');
    const overlay = document.getElementById('modalOverlay');
    const title = document.getElementById('addItemModalTitle');

    const typeLabels = {
        topic: 'Add New Topic',
        sop: 'Add New SOP',
        material: 'Add New Material'
    };

    title.textContent = typeLabels[itemType] || 'Add New Item';
    modal.setAttribute('data-item-type', itemType);
    modal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeAddItemModal() {
    const modal = document.getElementById('addItemModal');
    const overlay = document.getElementById('modalOverlay');

    modal.style.display = 'none';
    overlay.style.display = 'none';

    document.getElementById('addItemForm').reset();
}

function submitAddItem(event) {
    event.preventDefault();

    const modal = document.getElementById('addItemModal');
    const itemType = modal.getAttribute('data-item-type');

    const itemName = document.getElementById('itemName').value.trim();
    const description = document.getElementById('itemDescription').value.trim();
    const content = document.getElementById('itemContent').value.trim();

    if (itemType === 'topic' && currentPillar) {
        const newTopic = {
            id: `${currentPillar.id}-${Date.now()}`,
            title: itemName,
            pillarId: currentPillar.id,
            description: description,
            content: content || description
        };

        topics.push(newTopic);
        academyStore.topics = topics;

        showPillarDetail(currentPillar);

        console.log('Copy this topic object into academyStore.topics to make it permanent:', JSON.stringify(newTopic, null, 4));

        alert(
            `✅ Topic Added Successfully!\n\n` +
            `Title: ${itemName}\n` +
            `Description: ${description}\n\n` +
            `Note: This topic is added for the current session.\n` +
            `To make it permanent, copy the generated object from the browser console into academyStore.topics.`
        );
    }

    closeAddItemModal();
}

// Add Pillar Modal Functions
function openAddPillarModal() {
    const modal = document.getElementById('addPillarModal');
    const overlay = document.getElementById('pillarModalOverlay');

    modal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeAddPillarModal() {
    const modal = document.getElementById('addPillarModal');
    const overlay = document.getElementById('pillarModalOverlay');

    modal.style.display = 'none';
    overlay.style.display = 'none';

    document.getElementById('addPillarForm').reset();
}

function submitAddPillar(event) {
    event.preventDefault();

    const pillarName = document.getElementById('pillarName').value.trim();
    const smeName = document.getElementById('smeName').value.trim();
    const smeRole = document.getElementById('smePosition').value.trim();
    const smeEmail = document.getElementById('smeEmail').value.trim();

    if (!pillarName) {
        alert('Please provide a name for the new pillar.');
        return;
    }

    const baseId = pillarName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    let id = baseId || `pillar-${Date.now()}`;
    let suffix = 1;

    while (pillars.some(p => p.id === id)) {
        id = `${baseId}-${suffix++}`;
    }

    const newPillar = {
        id: id,
        title: pillarName,
        description: '',
        objective: '',
        smeName: smeName,
        smeEmail: smeEmail,
        smeRole: smeRole,
        topics: [],
        sops: [],
        materials: []
    };

    pillars.push(newPillar);

    const starterTopics = [
        {
            id: `${id}-overview`,
            title: `${pillarName} Overview`,
            pillarId: id,
            description: `Overview of ${pillarName}`,
            content: `Overview and background information for ${pillarName}.`
        },
        {
            id: `${id}-sop`,
            title: `${pillarName} SOPs`,
            pillarId: id,
            description: `${pillarName} SOPs`,
            content: `Standard operating procedures for ${pillarName}.`
        },
        {
            id: `${id}-guide`,
            title: `${pillarName} Guide`,
            pillarId: id,
            description: `${pillarName} Guide`,
            content: `Practical implementation guide for ${pillarName}.`
        },
        {
            id: `${id}-materials`,
            title: `${pillarName} Materials`,
            pillarId: id,
            description: `${pillarName} Materials`,
            content: `Reference materials and templates for ${pillarName}.`
        }
    ];

    topics = topics.concat(starterTopics);
    academyStore.topics = topics;

    renderPillars();
    closeAddPillarModal();

    console.log('Copy this pillar object into academyStore.pillars to make it permanent:', JSON.stringify(newPillar, null, 4));
    console.log('Copy these starter topics into academyStore.topics to make them permanent:', JSON.stringify(starterTopics, null, 4));

    alert(
        `✅ Pillar "${pillarName}" created successfully.\n\n` +
        `Note: This pillar is added for the current session.\n` +
        `To make it permanent, copy the generated objects from the browser console into academyStore.`
    );
}

// Search functionality
function handleSearch(event) {
    const query = (event.target.value || '').toLowerCase().trim();
    const searchResults = document.getElementById('searchResults');

    if (!query) {
        if (searchResults) searchResults.style.display = 'none';
        return;
    }

    const results = [
        ...pillars.filter(p =>
            (p.title || '').toLowerCase().includes(query) ||
            (p.description || '').toLowerCase().includes(query) ||
            (p.smeName || '').toLowerCase().includes(query)
        ).map(p => ({
            type: 'pillar',
            title: p.title,
            description: p.description || '',
            id: p.id
        })),
        ...topics.filter(t =>
            (t.title || '').toLowerCase().includes(query) ||
            (t.description || '').toLowerCase().includes(query)
        ).map(t => ({
            type: 'topic',
            title: t.title,
            description: t.description || '',
            id: t.id,
            pillarId: t.pillarId
        }))
    ];

    if (!results.length) {
        if (searchResults) searchResults.style.display = 'none';
        return;
    }

    searchResults.innerHTML = results.map(result => `
        <div class="searchResult" onclick="handleResultClick('${escapeAttribute(result.type)}', '${escapeAttribute(result.id)}')">
            <p class="searchResultTitle">${escapeHtml(result.title)}</p>
            <span class="searchResultType">${escapeHtml(result.type)}</span>
            <p class="searchResultDescription">${escapeHtml(result.description)}</p>
        </div>
    `).join('');

    if (searchResults) searchResults.style.display = 'block';
}

function handleResultClick(type, id) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    const searchResults = document.getElementById('searchResults');
    if (searchResults) searchResults.style.display = 'none';

    if (type === 'pillar') {
        const pillar = pillars.find(p => p.id === id);
        if (pillar) {
            showPillarDetail(pillar);
            return;
        }
    }

    if (type === 'topic') {
        const topic = topics.find(t => t.id === id);
        if (topic) {
            const pillar = pillars.find(p => p.id === topic.pillarId);

            if (pillar) {
                showPillarDetail(pillar);
                setTimeout(() => showItemDetail('topic', id, 0, topic.title), 150);
                return;
            }

            showItemDetail('topic', id, 0, topic.title);
        }
    }
}

// Chat functionality
function openChat() {
    const chatInterface = document.getElementById('chatInterface');
    const searchContainer = document.querySelector('.searchContainer');

    chatInterface.style.display = 'block';
    searchContainer.style.display = 'none';

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

function sendChatMessage() {
    const inputField = document.getElementById('chatInputField');
    const message = inputField.value.trim();

    if (!message) return;

    addChatMessage(message, 'user');

    const response = getStaticResponse(message);

    setTimeout(() => {
        addChatMessage(response, 'bot');
    }, 500);

    inputField.value = '';
    inputField.focus();
}

function addChatMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `chatMessage ${sender}`;

    const p = document.createElement('p');
    p.textContent = text;

    messageDiv.appendChild(p);
    messagesContainer.appendChild(messageDiv);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getStaticResponse(message) {
    const lowerMessage = message.toLowerCase();

    for (const [keyword, response] of Object.entries(chatResponses)) {
        if (lowerMessage.includes(keyword)) {
            return response;
        }
    }

    return chatResponses.default;
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function escapeAttribute(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
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
document.addEventListener('click', e => {
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');

    if (
        searchResults &&
        searchInput &&
        !searchResults.contains(e.target) &&
        !searchInput.contains(e.target)
    ) {
        searchResults.style.display = 'none';
    }
});

// Close chat when pressing Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const chatInterface = document.getElementById('chatInterface');

        if (chatInterface && chatInterface.style.display === 'block') {
            closeChat();
        }
    }
});