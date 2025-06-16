# Yuvraj Portfolio

A modern, interactive 3D portfolio website built with React and Three.js. This portfolio showcases my skills, projects, and experience through an immersive 3D experience.

![Portfolio Preview](https://yuvraj-portfolio-reimagined.vercel.app/)

## 🌐 Live Demo

[View Live Portfolio](https://yuvraj-portfolio-reimagined.vercel.app/)

## ✨ Features

- Interactive 3D elements and animations
- Responsive design for all devices
- Custom 3D models (Island, Fox, Bird, Plane)
- Particle effects
- Contact form with EmailJS integration
- Project showcase
- Experience timeline
- Smooth page transitions

# Future
- Interactive Code Playground: Let visitors experiment with your code live
- 3D Project Previews: Show projects as interactive 3D models
- Voice Navigation: Add voice commands for accessibility
- AR Business Card: QR code that opens AR version of your portfolio
- Real-time Collaboration: Show live coding sessions or pair programming
- Interactive trerminal -> which will give info about me like my internships, eductation,...

## 🛠️ Technologies Used

- **Frontend**: React, Vite
- **3D Rendering**: Three.js, React Three Fiber, @react-three/drei
- **Animation**: Framer Motion, GSAP, React Spring
- **Styling**: TailwindCSS
- **Particles**: tsParticles
- **Email**: EmailJS
- **Timeline**: React Vertical Timeline Component
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd yuvraj-portfolio-reimagined
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 📝 Project Structure

- `/src` - Source code
  - `/assets` - Static assets (images, fonts, etc.)
  - `/Components` - Reusable UI components
  - `/constants` - Configuration and constant values
  - `/hooks` - Custom React hooks
  - `/models` - 3D models (Sky, Island, Bird, Fox, Plane)
  - `/pages` - Main application pages (Home, About, Projects, Contact)

## 📦 Building for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## 💌 Contact Form Setup

This portfolio uses EmailJS for the contact form. To set up your own:

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Set up an email service and template
3. Update the service ID, template ID, and public key in the Contact component

## 🎨 Customization

- Edit `src/constants` files to update content
- Add your own 3D models in the `src/models` directory
- Modify the theme in `tailwind.config.js`

## 📄 License

MIT

## 🙏 Acknowledgements

- 3D Models from [Sketchfab](https://sketchfab.com/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Drei](https://github.com/pmndrs/drei)
- [TailwindCSS](https://tailwindcss.com/)
- [EmailJS](https://www.emailjs.com/)