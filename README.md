# 🧭 Restaurant Finder  

A simple interactive web app that helps users discover restaurants, cafés, and local food spots using **Leaflet Maps (OpenStreetMap)** and **Firebase Firestore**.  
Everything is free to use — no credit card required.

---

## 🚀 Features

- 🔍 Search restaurants by category  
- 📍 View restaurants on an interactive map  
- ⭐ Add restaurants (admin panel)  
- 🗄 Stores restaurant data in Firebase Firestore  
- 🗺 Uses free OpenStreetMap tiles (Leaflet JS)  
- ⚡ Fast frontend built with React + Vite  
- 🎨 Mobile-friendly responsive UI  

---

## 🛠 Tech Stack

| Purpose      | Technology                 |
|--------------|-----------------------------|
| Frontend     | React + Vite               |
| Map          | Leaflet + OpenStreetMap    |
| Database     | Firebase Firestore         |
| Deployment   | GitHub Pages / Vercel      |

---

## 📦 Installation

### **1️⃣ Clone the repository**
```sh
git clone https://github.com/YOUR-USERNAME/RestaurantFinder.git
cd RestaurantFinder
```

### **2️⃣ Install dependencies**
```sh
npm install
```

### **3️⃣ Start the development server**
```sh
npm run dev
```

---

## 🔧 Environment Variables

Create a file **`.env`** in the root folder:

```env
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

(You will get these keys from your Firebase Console.)

---

## 📁 Folder Structure

```
RestaurantFinder/
│── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   └── styles/
│── public/
│── package.json
│── vite.config.js
│── README.md
```

---

## 🖼 Screenshots

_Add screenshots of your UI once the project is ready._

---

## 🤝 Contributing

Pull requests are welcome!  
Feel free to open issues for improvements.

---

## 📄 License

MIT License  
You are free to use, modify, and distribute this project.
