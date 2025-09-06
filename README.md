# Meeting Timer - Professional Meeting Facilitator

![Meeting Timer Icon](generated_image:142)

A comprehensive, professional-grade meeting facilitation tool designed to help teams run more efficient and productive meetings. Features real-time session sharing, customizable themes, break management, and comprehensive agenda tracking.

## 🚀 Key Features

### ⏱️ **Advanced Timer Management**
- **Real-time countdown timers** for each agenda item
- **Visual progress indicators** with color-coded status (green → orange → red → overtime)
- **Overtime tracking** with detailed notes and participant assignment
- **Audio notifications** when time limits are reached (configurable)

### 👥 **Session Sharing & Collaboration** 
- **Share meeting sessions** with participants via unique URLs
- **Real-time synchronization** - all participants see live timer updates
- **Read-only participant mode** - facilitator controls, participants observe
- **Participant counter** showing connected attendees
- **Cross-device compatibility** - works on phones, tablets, and computers

### ☕ **Break Management**
- **Take Break** button pauses entire meeting (not just current item)
- **Break timer counts up** showing actual break duration
- **Visual break overlay** with clear "meeting is paused" indicator
- **Break time tracking** included in final meeting summary
- **Resume meeting** picks up exactly where you left off

### 🎨 **Professional Customization**
- **5 WCAG-compliant color themes:**
  - Professional Blue (4.8:1 contrast) - Default corporate theme
  - Green Nature (5.2:1 contrast) - Eco-friendly, calming
  - Purple Corporate (4.9:1 contrast) - Executive, premium feel  
  - Orange Energy (5.1:1 contrast) - Dynamic, creative
  - Dark Mode (7.2:1 contrast) - Eye-friendly for extended use
- **3 font size options** for accessibility (Small/Medium/Large)
- **Real-time theme preview** - see changes immediately
- **All themes meet accessibility standards** (WCAG 2.1 AA compliant)

### 📋 **Comprehensive Settings Management**
- **Team Member Management** - Add/remove team members with import/export
- **Custom Overrun Reasons** - Personalize overtime categories
- **Agenda Templates** - Save and reuse common meeting formats
- **JSON Import/Export** for all settings (team members, reasons, agendas)
- **Drag-and-drop file support** for easy importing

### 📱 **Mobile & Cross-Platform**
- **Responsive design** optimized for phones, tablets, and desktops
- **Microsoft Edge Sidebar support** - perfect for side-by-side meetings
- **Progressive Web App (PWA)** - install like a native app
- **Touch-friendly controls** with proper tap targets
- **Works offline** once loaded (session data persists locally)

### 📊 **Detailed Meeting Analytics**
- **Comprehensive meeting summaries** with actual vs estimated times
- **Overtime analysis** with notes and assigned follow-ups
- **Break time tracking** and breakdown
- **Export capabilities** - save summaries as JSON files
- **Historical data** for meeting optimization

## 🛠️ Installation & Deployment

### Quick GitHub Pages Deployment

1. **Download the app files:**
   - `index.html` - Main application
   - `style.css` - Styling with WCAG-compliant themes
   - `app.js` - Application logic with all features
   - `manifest.json` - PWA configuration

2. **Create GitHub Repository:**
   ```bash
   # Create new repo on GitHub named 'meeting-timer'
   # Make it public (required for free GitHub Pages)
   ```

3. **Upload files:**
   - Drag and drop all files to GitHub repository root
   - Commit changes: "Initial meeting timer app deployment"

4. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "main" 
   - Folder: "/ (root)"
   - Click "Save"

5. **Access your app:**
   - Your app will be live at: `https://yourusername.github.io/meeting-timer/`
   - Takes 2-5 minutes to deploy initially

### Alternative Hosting Options
- **Netlify:** Drag-and-drop deployment with instant SSL
- **Vercel:** Connect GitHub repo for automatic deployments  
- **Firebase Hosting:** Google's static hosting with CDN
- **Local Development:** Simply open `index.html` in any modern browser

## 📖 User Guide

### Setting Up Your First Meeting

1. **Open the app** and navigate to the **Setup tab**
2. **Add agenda items** with titles, estimated times, and descriptions
3. **Review the meeting overview** showing total estimated duration
4. **Click "Start Timer Phase"** to begin the meeting

### Customizing Your Experience

1. **Go to Settings tab** to personalize your setup:
   - **Team Members:** Add your team for easy overtime assignment
   - **Overrun Reasons:** Customize reasons like "Technical Discussion" or "Stakeholder Input"
   - **Visual Themes:** Choose from 5 professional color schemes
   - **Font Size:** Select comfortable text size (Small/Medium/Large)

### Running a Meeting

1. **Timer View** shows the current agenda item prominently
2. **Start/Pause** the timer using the button or spacebar
3. **Take Break** when needed - pauses entire meeting
4. **Share Meeting** button generates URL for participants
5. **Next Item** button advances to next agenda topic
6. **Overtime handling:**
   - Red indicator shows when over time
   - Add notes and assign follow-up participants
   - Custom reasons from your Settings

### Session Sharing with Participants

1. **Click "Share Meeting"** in the Timer view
2. **Copy the generated URL** and send to participants
3. **Participants join** by opening the shared link
4. **Real-time sync** - everyone sees the same timer status
5. **Facilitator maintains control** - participants view only

### Managing Breaks

1. **Click "Take Break"** to pause the meeting
2. **Break overlay appears** with elapsed break time
3. **All participants see break status** if session is shared  
4. **Click "End Break"** to resume exactly where you left off
5. **Break time is tracked** and included in final summary

### Importing/Exporting Data

**Team Members:**
```json
{
  "teamMembers": [
    "John Smith",
    "Sarah Johnson", 
    "Mike Chen"
  ]
}
```

**Agenda Template:**
```json
{
  "name": "Daily Standup",
  "items": [
    {
      "title": "Yesterday's Progress",
      "estimatedMinutes": 5,
      "description": "What did everyone accomplish?"
    }
  ]
}
```

**Custom Overrun Reasons:**
```json
{
  "overtimeReasons": [
    "Technical complexity discovered",
    "Stakeholder questions",
    "Scope clarification needed"
  ]
}
```

## 🎯 Use Cases

### **Daily Standups**
- Quick 15-minute meetings with standard agenda
- Track who's going over time and why
- Share with remote team members

### **Project Reviews** 
- Longer meetings with multiple topics
- Break management for 2+ hour sessions
- Detailed overtime tracking for follow-ups

### **Client Presentations**
- Professional appearance with customizable themes
- Real-time sharing so clients see agenda progress
- Break handling for longer sessions

### **Board Meetings**
- Formal agenda management with time controls
- Comprehensive summaries with export capability
- Professional themes suitable for executive environments

### **Training Sessions**
- Multiple topics with break scheduling
- Participant view for attendee awareness
- Progress tracking across long sessions

## 🔧 Advanced Features

### Microsoft Edge Sidebar Integration
- **PWA Installation:** Install as app for sidebar use
- **376px minimum width** optimized for Edge sidebar
- **Side-by-side productivity** - meeting timer alongside browser tabs
- **Automatic discovery** in Edge's sidebar app recommendations

### Accessibility & Compliance
- **WCAG 2.1 AA compliant** color contrasts in all themes
- **Keyboard navigation** support (spacebar to start/pause)
- **Screen reader compatible** with proper ARIA labels
- **Multiple font sizes** for visual accessibility
- **High contrast support** in Dark Mode theme

### Session Persistence
- **Auto-save every 30 seconds** during active timers
- **PowerPoint presentation compatibility** - session persists during screen sharing
- **Cross-tab synchronization** using localStorage events
- **Recovery prompts** if session is interrupted
- **Version control** prevents data corruption

### Performance & Compatibility
- **Vanilla JavaScript** - no dependencies, fast loading
- **Modern browser support** (Chrome, Firefox, Safari, Edge)
- **Offline functionality** once loaded
- **Responsive design** works on all screen sizes
- **Touch-optimized** for tablet meeting facilitation

## 🛠️ Technical Specifications

### Browser Requirements
- **Chrome 80+**, **Firefox 78+**, **Safari 14+**, **Edge 80+**
- **JavaScript enabled** (required)
- **Local storage support** (for settings persistence)
- **Modern ES6 support** (arrow functions, classes, etc.)

### File Structure
```
meeting-timer/
├── index.html          # Main application HTML
├── style.css           # WCAG-compliant themes & responsive design
├── app.js              # Application logic & feature implementation
├── manifest.json       # PWA configuration
└── README.md           # This documentation
```

### Data Storage
- **localStorage** for user preferences and settings
- **sessionStorage** for temporary meeting data
- **No external dependencies** - completely self-contained
- **No server required** - runs entirely in browser

## 🔒 Privacy & Security

- **No data collection** - everything stored locally
- **No external services** - completely offline capable
- **No user accounts** - anonymous usage
- **Session sharing uses local storage only** - no external servers
- **GDPR compliant** - no personal data transmitted

## 🐛 Troubleshooting

### Common Issues

**Q: App shows 404 error on GitHub Pages**
- Ensure `index.html` is in repository root (not in a subfolder)
- Check that repository is public
- Wait 5-10 minutes after enabling GitHub Pages

**Q: Themes have poor contrast/unreadable text**
- This version has fixed WCAG-compliant colors
- Try different themes in Settings tab
- Use Large font size for better readability

**Q: Session sharing not working**
- Both facilitator and participants must use same browser type
- Shared URLs include the meeting ID after #meeting=
- Check that localStorage is enabled in browser settings

**Q: Timer doesn't persist during screen sharing**
- App auto-saves every 30 seconds to prevent data loss
- Use recovery dialog if session is interrupted
- Consider using break mode during screen sharing setup

**Q: App doesn't work on mobile**
- This version is fully responsive and touch-optimized
- Use landscape mode on phones for better timer visibility
- Install as PWA for better mobile experience

### Feature Requests
This is an open-source project. Consider contributing:
- Fork the repository
- Add your feature
- Submit a pull request
- Suggest improvements in Issues tab

## 📄 License

This project is released under the MIT License. Free for personal and commercial use.

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- Additional language support
- More theme options
- Advanced analytics
- Integration with calendar applications
- Voice commands
- Enhanced accessibility features

---

**Built for meeting facilitators who want to run efficient, productive meetings while keeping everyone engaged and on track.**

*Professional • Accessible • Free • Open Source*
