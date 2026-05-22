// Data
let currentItemType = '';
const pillars = [
    {
        id: 'ai-ml-agents',
        title: 'AI/ML & Agents',
        //description: 'Build intelligent systems and agentic AI workflows for enterprise automation',
        //objective: 'Enable teams to understand and implement AI/ML solutions and agentic workflows for automating enterprise processes.',
        smeName: 'Avinash Kumar',
        smeEmail: 'avinash.kumar@pfizer.com',
        smeRole: 'Senior Risk Consulting',
        topics: ['Intro to AI', 'AI SOPs', 'AI Validation Checklist', 'AI Materials'],
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
        // description: 'Master data extraction, transformation, and loading across enterprise systems',
        // objective: 'Equip teams with skills to design, build, and maintain efficient ETL pipelines for enterprise data integration.',
        smeName: 'Arjun Agarwal',
        smeEmail: 'arjun.agarwal@pfizer.com',
        smeRole: 'Senior Risk Consulting',
        topics: ['ETL Fundamentals', 'ETL SOPs', 'ETL Validation', 'ETL Materials'],
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
        // description: 'Ensure data quality, accuracy, and integrity throughout your workflows',
        // objective: 'Establish consistent validation practices and ensure data quality across all enterprise systems and processes.',
        smeName: 'Aayush Saxena',
        smeEmail: 'aayush.saxena@pfizer.com',
        smeRole: 'Senior Risk Consulting',
        topics: ['Validation Basics', 'Validation SOPs', 'Validation Checklist', 'Validation Guide'],
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
        //description: 'Business Technology & Quality - Transform operations with technology',
        //objective: 'Integrate business processes with quality practices using modern technology solutions.',
        smeName: 'Aniruddha Desai',
        smeEmail: 'aniruddha.desai@pfizer.com',
        smeRole: 'Operations & Technology Lead',
        topics: ['BTQ Overview', 'BTQ SOPs', 'Quality Assurance', 'Technology Integration'],
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
];

const topics = [
    { id: 'intro-ai', title: 'Intro to AI', pillarId: 'ai-ml-agents', description: 'Introduction to AI and Machine Learning concepts' },
    { id: 'sop-ai', title: 'AI SOPs', pillarId: 'ai-ml-agents', description: 'Standard Operating Procedures for AI systems' },
    { id: 'intro-etl', title: 'ETL Fundamentals', pillarId: 'etl', description: 'Understand the basics of ETL processes' },
    { id: 'sop-etl', title: 'ETL SOPs', pillarId: 'etl', description: 'Standard Operating Procedures for ETL' },
    { id: 'intro-val', title: 'Validation Basics', pillarId: 'validation', description: 'Fundamentals of data validation' },
    { id: 'sop-val', title: 'Validation SOPs', pillarId: 'validation', description: 'Standard Operating Procedures for Validation' },
    { id: 'intro-btq', title: 'BTQ Overview', pillarId: 'btq', description: 'Overview of Business Technology & Quality' },
    { id: 'sop-btq', title: 'BTQ SOPs', pillarId: 'btq', description: 'Standard Operating Procedures for BTQ' }
];

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

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    renderPillars();
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

function showPillarDetail(pillar) {
    currentPillar = pillar;
    // Hide main content
    document.querySelector('.main').style.display = 'none';
    
    // Show detail page
    const detailPage = document.getElementById('pillarDetailPage');
    detailPage.style.display = 'block';

    // Populate detail content
    document.getElementById('detailPillarTitle').textContent = pillar.title;
    // document.getElementById('detailObjective').textContent = pillar.objective;
    // document.getElementById('detailDescription').textContent = pillar.description;

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
                    description: 'Detailed SME-driven learning content',
                    content: `Detailed content for ${topic}`
                }
                : topic;

    return `
        <div
            class="topicCard"
            onclick="showItemDetail(
                'topic',
                '${pillar.id}',
                ${idx},
                '${escapeHtml(topicObj.title)}'
            )"
        >
            <h3>${escapeHtml(topicObj.title)}</h3>

            <p>
                ${topicObj.description}
            </p>
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
    
    // Hide pillar detail page
    document.getElementById('pillarDetailPage').style.display = 'none';
    
    // Show item detail page
    const itemDetailPage = document.getElementById('itemDetailPage');
    itemDetailPage.style.display = 'block';

    // Populate item detail
    document.getElementById('itemDetailTitle').textContent = title;
    
    // Generate sample content based on type and title
    const keyPoints = getItemKeyPoints(type, title);
    let content = getItemContent(type, title);

    if (type === 'topic') {

        const pillar = pillars.find(p => p.id === pillarId);

        if (pillar && pillar.topics[index]) {

            const topic = pillar.topics[index];

            if (typeof topic === 'object') {

                content = topic.content || content;
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

function submitAddItem(event) {

    event.preventDefault();

    const itemName =
        document.getElementById('itemName').value.trim();

    const itemDescription =
        document.getElementById('itemDescription').value.trim();

    const itemContent =
        document.getElementById('itemContent').value.trim();

    if (!itemName || !itemDescription || !itemContent) {

        alert('Please fill all fields');

        return;
    }

    const itemType =
        document.getElementById('addItemModal')
        .getAttribute('data-item-type');

    // CREATE TOPIC OBJECT
    const newTopic = {

        id: itemName
            .toLowerCase()
            .replace(/\s+/g, '-'),

        title: itemName,

        description: itemDescription,

        content: itemContent
    };

    // ADD TO CURRENT PILLAR
    if (itemType === 'topic') {

        currentPillar.topics.push(newTopic);

        topics.push({
            id: newTopic.id,
            title: newTopic.title,
            pillarId: currentPillar.id,
            description: newTopic.description,
            content: newTopic.content
        });
    }

    // CLOSE MODAL
    closeAddItemModal();

    // RELOAD UI
    showPillarDetail(currentPillar);

    // SUCCESS
    alert(`${itemName} created successfully.`);
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

    const pillarName =
        document.getElementById('pillarName').value.trim();

    const smeName =
        document.getElementById('smeName').value.trim();

    const smePosition =
        document.getElementById('smePosition').value.trim();

    const smeEmail =
        document.getElementById('smeEmail').value.trim();

    if (!pillarName || !smeName || !smePosition || !smeEmail) {

        alert('Please fill all required fields');

        return;
    }

    // Generate pillar object
    const newPillar = {

        id: pillarName
            .toLowerCase()
            .replace(/\s+/g, '-'),

        title: pillarName,

        description:
            `${pillarName} enterprise learning and capability pillar.`,

        smeName: smeName,

        smeEmail: smeEmail,

        smeRole: smePosition,

        topics: [],

        sops: [],

        materials: []
    };

    // Push into main pillars array
    pillars.push(newPillar);

    // Close modal
    closeAddPillarModal();

    // Re-render frontend cards
    renderPillars();

    // SUCCESS FEEDBACK
    alert(`${pillarName} pillar created successfully.`);
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

    if (message.length === 0) return;

    // Add user message
    addChatMessage(message, 'user');

    // Get bot response
    const response = getStaticResponse(message);

    // Add bot response after a short delay
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
    
    if (!searchResults.contains(e.target) && !searchInput.contains(e.target)) {
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

function renderTopicsGrid(pillar) {
    const topicsContainer = document.getElementById('topicsGridContainer');

    if (!topicsContainer) return;

    topicsContainer.innerHTML = '';

    pillar.topics.forEach((topicName, index) => {
        const card = document.createElement('div');
        card.className = 'topicCard';

        card.innerHTML = `
            <h3>${topicName}</h3>
            <p>
                Detailed learning content and SME-driven material for ${topicName}.
            </p>
        `;

        card.addEventListener('click', () => {
            openTopicDetail(topicName, pillar.title, index);
        });

        topicsContainer.appendChild(card);
    });
}

function openTopicDetail(topicName, pillarName, index) {
    const detailContent = document.getElementById('detailContent');

    detailContent.innerHTML = `
        <div class="detailSection">
            <button class="backBtn" onclick="showPillarDetail(currentPillar)">
                ← Back
            </button>

            <h1>${topicName}</h1>

            <p>
                This is dynamically generated content for ${topicName} under ${pillarName}.
                Each topic page now has separate rendered content.
            </p>

            <div class="detailCard">
                <h3>Learning Objectives</h3>
                <p>
                    Topic ${index + 1} focuses on enterprise workflows,
                    SOPs, automation and governance.
                </p>
            </div>
        </div>
    `;
}

function openAddItemModal(type) {

    currentItemType = type;

    document.getElementById('addItemModal').style.display = 'flex';
    document.getElementById('modalOverlay').style.display = 'block';

    document.getElementById('addItemModalTitle').textContent =
        `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;

    document.getElementById('itemName').value = '';
    document.getElementById('itemDescription').value = '';
    document.getElementById('itemContent').value = '';
}
