# Pfizer Learning Academy - Simple Frontend

A lightweight HTML/CSS/JavaScript frontend for Pfizer Learning Academy. This is a static version without React dependencies, designed for quick deployment and easy customization.

## 🚀 Features

- **Simple Design**: Clean, modern interface built with vanilla HTML, CSS, and JavaScript
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Interactive Pillars**: 4 Business Pillars with expandable content
- **Add Pillar Workflow**: Add new business pillars using the + button
- **Search Functionality**: Search through pillars and topics with instant results
- **Chat Assistant**: Static chat interface with keyword-based responses (expandable with LLM API in future)
- **Pfizer Branding**: Updated from AiXEL to Pfizer Learning Academy

## 📁 File Structure

```
simple-frontend/
├── index.html      # Main HTML file with page structure
├── styles.css      # All CSS styles and responsive design
├── app.js          # JavaScript for interactivity
└── README.md       # This file
```

## 🎯 Sections

### Header
- Logo: "Pfizer Learning Academy"
- Navigation: Home, Pillars, Topics
- Search bar with real-time results
- Explore Pillars CTA button
- EY & Pfizer branding logos

### Hero Section
- Main headline: "Accelerate Enterprise Learning"
- Descriptive subtitle
- Call-to-action buttons
- Quick stats chips

### Stats Strip
- 4 Business Pillars
- 16 Topics
- 50+ Learning Hours
- 100% SME-Led

### Business Pillars
4 core pillars with sample content:
1. **AI/ML & Agents** - Intelligent systems and agentic AI workflows
2. **ETL** - Data extraction, transformation, and loading
3. **Validation** - Data quality, accuracy, and integrity
4. **BTQ** - Business Technology & Quality

### Add Pillar Feature
- Click the + card to add a new pillar
- Shows info message about future implementation

### Search Bar
- Static search with expandable interface
- Click to open chat interface
- Keyword-based static responses

### Chat Assistant
- Expandable chat interface
- Static keyword-based responses
- Ready for future LLM API integration
- Close with Escape key or close button

### Footer
- Copyright and branding information

## 💻 How to Use

1. **Open the Page**
   ```bash
   Simply open index.html in your web browser
   ```

2. **Explore Pillars**
   - Click "Explore Pillars" button or scroll to pillars section
   - Click any pillar card to see details
   - Click + card to see add pillar info

3. **Search Content**
   - Use the header search bar to find pillars and topics
   - Click on any result to view details

4. **Use Chat Assistant**
   - Click the search bar to open chat interface
   - Type questions like "Tell me about AI" or "What is ETL"
   - Chat provides static responses (LLM integration coming soon)

## 🎨 Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --bg: #0b0b0b;        /* Background */
    --yellow: #FFE600;    /* Primary color */
    --white: #FFFFFF;     /* Text color */
    --muted: #CFCFCF;     /* Secondary text */
    --card: #121212;      /* Card background */
}
```

### Content
Edit the data arrays in `app.js`:
```javascript
const pillars = [
    { id, title, description, topics }
];

const topics = [
    { id, title, pillarId, description }
];
```

### Chat Responses
Add or modify responses in `app.js`:
```javascript
const chatResponses = {
    'keyword': 'Your response here',
    // ...
};
```

## 🔄 Integration Notes

- **Future LLM Integration**: The chat interface is ready to integrate with an LLM API. Update `getStaticResponse()` function in `app.js` to call your API instead.
- **Backend Connection**: Update search and navigation to connect with backend services as needed.
- **Styling**: All styles use CSS custom properties for easy theming.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🔧 Technical Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript**: No frameworks or dependencies
- **Responsive Design**: Mobile-first approach

## 📝 Sample Content

### Business Pillars
- **AI/ML & Agents**: Build intelligent systems and agentic AI workflows for enterprise automation
- **ETL**: Master data extraction, transformation, and loading across enterprise systems
- **Validation**: Ensure data quality, accuracy, and integrity throughout your workflows
- **BTQ**: Business Technology & Quality - Transform operations with technology

### Topics per Pillar
Each pillar includes 4 topics covering:
- Introduction/Fundamentals
- Standard Operating Procedures (SOPs)
- Validation/Checklists
- Materials/Resources

## 🚢 Deployment

1. Copy all files to your web server
2. No build process required
3. Works with any static file hosting service
4. Can be embedded in existing applications

## 📧 Support

For questions or customization requests, contact your administrator.

---

Built with ❤️ for Pfizer Learning Academy
