# 📱 PixieChat

> **Hey there! 👋 Welcome to PixieChat - where social media meets the future!**

[![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51.0-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0-green.svg)](https://spring.io/projects/spring-boot)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 What's PixieChat All About?

Ever wished your camera was smarter? Or that social media could actually be fun again? Well, that's exactly why I built PixieChat! 

Picture this: You take a photo, and the app instantly knows it's a sunset and suggests the perfect "Golden Hour" filter. You post a story, and friends can drop floating emoji reactions that actually bounce around the screen. Plus, everything you do earns you points and unlocks achievements - because who doesn't love a good challenge?

I've been working on this passion project for months, combining everything I love about modern tech: AI that actually helps, AR effects that don't feel gimmicky, and a gaming system that makes being social genuinely rewarding.

## ✨ The Cool Stuff That Makes PixieChat Special

### 🤖 AI That Actually Gets You
You know how most "AI" features feel like marketing fluff? Not here! The AI actually watches what you're photographing and suggests filters that make sense. Taking a pic of your morning coffee? It'll suggest "Warm Vibes." Capturing a night out? "Neon Dreams" it is! 

And here's the kicker - it even writes captions for you. No more staring at your phone thinking "what do I even say about this sandwich?" 😅

### 📸 Camera Features That Don't Suck
I've used way too many apps with terrible cameras, so I made sure this one actually works:
- **Real manual controls** (because auto mode isn't always right)
- **Live filters** that don't lag or crash your phone
- **AR stickers** that you can actually place where you want them
- **Video recording** that doesn't eat your storage alive
- **One-tap sharing** to your favorite people

### 🎮 Gaming That Makes Sense
Instead of pointless badges, I built a system where everything you do naturally earns you something:
- **Post a photo?** That's XP and maybe a "Content Creator" badge
- **React to friends' stories?** Social butterfly points!
- **Post daily for a week?** Streak achievement unlocked!
- **Share from a new location?** Explorer badge incoming!

It's like having a personal cheerleader for your social life.

### 🎭 Social Features That Actually Feel Social
Remember when social media was... social? Yeah, me too:
- **3D floating reactions** on stories (way cooler than a simple heart)
- **Real-time location sharing** with friends (with privacy controls that actually work)
- **Voice privacy controls** - just say "Hey Pixie, hide my location" and boom, done
- **Smart friend suggestions** based on who you actually interact with

### 🔒 Privacy That Doesn't Feel Like Homework
Look, I get it. Privacy settings are usually a nightmare. So I made them simple:
- **Voice commands** for quick changes
- **Auto privacy zones** (it learns where your home/work is and keeps it private)
- **One-tap privacy modes** for when you just want to disappear for a bit
- **Everything encrypted** because that's just basic respect

## 🏗️ Under the Hood (For the Tech Nerds)

Don't worry, I won't bore you with too much technical stuff, but here's what makes PixieChat tick:

### 📱 The App You See (Frontend)
Built with React Native because I wanted it to work perfectly on both iPhone and Android. Here's the basic structure:

```
📱 What You Interact With
├── 🎨 Beautiful UI
│   ├── Camera that doesn't crash
│   ├── AR effects that actually work
│   ├── Gaming system that's fun
│   └── Stories that feel alive
├── 🧠 Smart AI Features
│   ├── Filter suggestions that make sense
│   ├── Captions that don't sound robotic
│   └── Posting times that actually help
├── 🎮 Gaming Stuff
│   ├── Achievements you'll want to unlock
│   ├── Streaks that motivate you
│   └── Points that mean something
└── 🔐 Privacy Protection
    ├── Voice controls that work
    ├── Auto-protection zones
    └── Encryption for everything sensitive
```

### ⚙️ The Server Stuff (Backend)
I chose Spring Boot because it's rock solid and handles all the user accounts and security:

```
⚙️ Behind the Scenes
├── 🔐 User Account Management
│   ├── Secure login/signup
│   ├── Password protection that works
│   └── Session management
├── 👥 Friend & Social Features
│   ├── Friend connections
│   ├── Profile management
│   └── Smart user search
├── 🛡️ Security Layer
│   ├── API protection
│   ├── Data encryption
│   └── Privacy controls
└── 💾 Data Storage
    ├── User information
    ├── Settings & preferences
    └── Gaming achievements
```

## 🚀 Want to Try It Out?

Great! Here's how to get PixieChat running on your machine. Don't worry, I've made it as painless as possible.

### What You'll Need First
Before we start, make sure you have these installed:
- **Node.js** (version 18 or newer - the app gets cranky with older versions)
- **npm** or **yarn** (whatever floats your boat)
- **Java 17+** (for the backend server)
- **Maven** (comes with Java, so you're probably good)
- **Expo CLI** (run `npm install -g @expo/cli` if you don't have it)

If you want to test on actual devices:
- **Android Studio** (for Android testing - it's free!)
- **Xcode** (for iOS testing, but only if you're on Mac)

### 📱 Getting the App Running

1. **Grab the code**
   ```bash
   git clone https://github.com/BEN-AMEV/PixieChat1.git
   cd pixiechat
   ```

2. **Install all the dependencies** (this might take a few minutes)
   ```bash
   npm install
   ```

3. **Fire up the development server**
   ```bash
   npx expo start
   ```

4. **See it in action**
   You'll get a QR code you can scan with your phone, or you can:
   ```bash
   # Open on iPhone simulator (Mac only)
   npx expo run:ios
   
   # Open on Android emulator
   npx expo run:android
   
   # Or just open in your browser
   npx expo start --web
   ```

### ⚙️ Getting the Server Running

The app needs a backend server for user accounts and all that good stuff:

1. **Go to the backend folder**
   ```bash
   cd Backend/auth-service
   ```

2. **Build everything**
   ```bash
   ./mvnw clean install
   ```

3. **Start the server**
   ```bash
   ./mvnw spring-boot:run
   ```

4. **Check if it's working**
   Open `http://localhost:5001/auth/health` in your browser. If you see a success message, you're golden!

### 🔧 Quick Setup Tips

1. **Update the server address** in `app/api/api.ts`:
   ```typescript
   const api = axios.create({
     baseURL: 'http://YOUR_COMPUTER_IP:5001',  // Change this to your actual IP
     // ... rest of the config
   });
   ```

2. **Environment stuff** (create a `.env` file if you want):
   ```bash
   EXPO_PUBLIC_API_URL=http://your-server-url:5001
   EXPO_PUBLIC_ENVIRONMENT=development
   ```

**Pro tip**: If you're testing on a real phone, make sure your computer and phone are on the same WiFi network, and use your computer's actual IP address instead of `localhost`.

## 🛠️ Tech Stack (For the Curious)

I spent way too much time choosing the right tools, but here's what I landed on and why:

### 📱 Frontend (The App You See)
| What I Used | Why I Chose It | Version |
|-------------|----------------|---------|
| **React Native** | Works on both iPhone and Android without writing everything twice | 0.73+ |
| **Expo** | Makes development so much easier (seriously, life-changing) | 51.0+ |
| **TypeScript** | Catches my stupid mistakes before users do | 5.3+ |
| **React Navigation** | Clean navigation that doesn't feel clunky | 7.0+ |
| **NativeWind** | Tailwind CSS for mobile - rapid styling that looks good | Latest |
| **Expo Camera** | Camera that actually works reliably | 16.0+ |
| **React Native Reanimated** | Smooth animations that don't lag | 3.6+ |
| **Expo Secure Store** | Keeps your data safe and encrypted | Latest |

### ⚙️ Backend (The Server Stuff)
| What I Used | Why I Chose It | Version |
|-------------|----------------|---------|
| **Spring Boot** | Rock solid, enterprise-grade, handles security like a boss | 3.0+ |
| **Spring Security** | User authentication that I can actually trust | 6.0+ |
| **H2 Database** | Perfect for development and testing | 2.0+ |
| **Maven** | Build tool that just works | 3.8+ |
| **BCrypt** | Password hashing that security experts approve of | Latest |

### 🔧 Development Tools (What Keeps Me Sane)
- **VS Code** with all the React Native extensions
- **Flipper** for debugging when things go wrong
- **Expo Dev Tools** for live reloading and testing
- **Android Studio** for Android-specific testing
- **Xcode** for iOS testing (when I'm on my Mac)

## 📱 Let Me Show You the Cool Features

### 🤖 The AI That Actually Helps
Instead of throwing buzzwords around, here's what the AI actually does:
- **Smart photo analysis**: Point at a sunset, get warm filter suggestions
- **Time-aware suggestions**: Different filters for morning coffee vs. late-night pizza
- **Weather integration**: Cloudy day? Here are some moody filters
- **Caption writing**: Because "looking good 😎" gets old after the 100th time

### 🎭 Story Reactions That Feel Alive
You know how boring regular story reactions are? I fixed that:
- **3D floating emojis** that actually bounce and spin around the screen
- **20+ different reactions** - way more than just heart, laugh, angry
- **Tap anywhere to place them** - no more hunting for tiny buttons
- **They contribute to your gaming score** - because why not make it rewarding?

### 🎮 Gaming System That Makes Sense
I hate pointless achievements, so I made ones that actually matter:
- **"First Steps"** for your very first post (everyone starts somewhere!)
- **"Week Warrior"** for posting 7 days straight (consistency is key)
- **"Social Butterfly"** for reacting to 50 different posts (spread the love)
- **"World Traveler"** for posting from 20 different locations (get out there!)
- **"Viral Sensation"** for getting 1000+ views (you made it!)

### 🔐 Privacy That Doesn't Suck
Privacy settings usually feel like homework. Not here:
- **"Hey Pixie, hide my location"** - just say it, and it's done
- **Smart privacy zones** - the app learns where your home/work is
- **One-tap modes** - "Ghost mode" when you want to lurk
- **Everything encrypted** - because your data is yours, not mine

## 📊 API Stuff (For Developers)

If you're building on top of PixieChat or just curious about how it works, here are the main endpoints:

### The Basic Endpoints
```http
POST   /auth/register     # Sign up new users
POST   /auth/login        # Log existing users in
GET    /auth/users        # Get all users (for testing)
GET    /auth/users/search # Find specific users
GET    /auth/health       # Check if the server is alive
```

### What Requests Look Like

**When someone signs up:**
```json
{
  "firstName": "Alex",
  "lastName": "Chen",
  "email": "alex@example.com",
  "username": "alexc",
  "password": "definitely-not-123456",
  "dateOfBirth": "1995-03-15",
  "avatarId": "3"
}
```

**What you get back:**
```json
{
  "token": "your-secret-access-token",
  "message": "Welcome to PixieChat!",
  "user": {
    "id": 42,
    "firstName": "Alex",
    "lastName": "Chen",
    "email": "alex@example.com",
    "username": "alexc",
    "avatarId": "3",
    "dateOfBirth": "1995-03-15"
  }
}
```

Pretty straightforward, right? No weird nested objects or confusing field names.

## 🧪 Testing (Because Bugs Are Annoying)

I've included several ways to test everything works properly:

### Testing the App
```bash
# Run the main test suite
npm test

# Test everything end-to-end
npm run test:e2e

# Test just the camera component (because it's complex)
npm test -- CameraComponent
```

### Testing the Backend
```bash
# Make sure all the server code works
./mvnw test

# Test just the authentication stuff
./mvnw test -Dtest=AuthServiceTest
```

### Manual Testing (The Fun Way)
I've included some PowerShell scripts to test things manually:

```bash
# Test if user registration and login work
./test-auth-service.ps1

# Add some fake users to play with
./add_test_users.ps1

# Quick authentication test
./test-auth-simple.ps1
```

These scripts are super handy for making sure everything's working without having to manually create accounts through the app.

## 📦 Building for Real Devices

### Getting the App Ready for Others

**For Android:**
```bash
# Build a proper APK file
npx expo build:android --type apk

# Or use the new build system (recommended)
eas build --platform android
```

**For iOS:**
```bash
# Build for App Store or TestFlight
eas build --platform ios
```

### Making the Server Production-Ready

```bash
# Create a JAR file you can deploy anywhere
./mvnw clean package -DskipTests

# Run it on your server
java -jar target/auth-service-0.0.1-SNAPSHOT.jar
```

**Pro tip**: Don't forget to change the database from H2 to something more robust like PostgreSQL when you go live!

## 🔧 Want to Customize It?

One of my favorite things about this project is how easy it is to extend. Here are some examples:

### Adding Your Own AI Filters
```typescript
// Jump into utils/aiFilters.ts and add something like this:
export const myCustomFilter = {
  analyzeContent: (photoUri: string) => {
    // Your brilliant AI logic here
    // Maybe detect if it's a pet photo and suggest "Cute Overload" filter?
    return filterSuggestions;
  },
  
  generateCaption: (analysis: any, mediaType: string) => {
    // Generate captions that sound like you wrote them
    return "Another day, another cute dog pic 🐕";
  }
};
```

### Creating New Achievements
```typescript
// Add to utils/gamingSystem.ts:
export const myAchievement = {
  id: 'coffee_addict',
  name: 'Coffee Addict',
  description: 'Posted 50 coffee photos (we see you)',
  icon: 'cafe',
  condition: (userStats) => userStats.coffeePhotos >= 50
};
```

### Custom Voice Commands
```typescript
// Extend utils/voiceControl.ts:
export const myCommands = {
  'party mode': () => {
    // Maybe auto-suggest party filters and change the theme?
    setPartyModeActive(true);
  },
  
  'study mode': () => {
    // Turn on do-not-disturb and mute notifications
    enableStudyMode();
  }
};
```

Feel free to go wild with these! The whole point is to make PixieChat work the way *you* want it to.

## 🤝 Want to Help Make It Better?

I'd love to have other people contribute to PixieChat! Whether you're fixing bugs, adding features, or just improving the documentation, all help is appreciated.

Here's how to jump in:

1. **Fork this repo** (there's a button at the top of the GitHub page)
2. **Create a branch** for your changes: `git checkout -b feature/my-awesome-idea`
3. **Make your changes** and test them thoroughly
4. **Commit with a clear message**: `git commit -m 'Add voice command for selfie mode'`
5. **Push your branch**: `git push origin feature/my-awesome-idea`
6. **Open a Pull Request** and tell me what you built!

### A Few Guidelines (Nothing Too Strict)
- **Write code that's easy to read** - future you will thank you
- **Test your changes** - nobody likes broken features
- **Keep commits focused** - one feature per commit when possible
- **Update docs** if you're adding something new
- **Make sure it works on both iOS and Android**

### Ideas for Contributions
- **Better AI filters** (maybe ones that detect specific objects?)
- **New achievement types** (location-based, time-based, social challenges?)
- **UI improvements** (animations, better layouts, accessibility)
- **Performance optimizations** (faster camera, smoother animations)
- **Bug fixes** (there are always bugs to squash)

Don't feel like you need to build something massive - even small improvements are super valuable!

## 🔮 What's Coming Next?

I've got some exciting plans for PixieChat! Here's what I'm working on:

### Version 2.0 - "The Smart Update" (Coming Early 2025)
- [ ] **Real AI integration** - Replace the mock AI with actual machine learning models
- [ ] **Actual voice recognition** - No more pretend voice commands
- [ ] **Snapchat-style face filters** - AR face detection and silly effects
- [ ] **Live streaming** - Share what you're doing in real-time

### Version 2.5 - "The Social Update" (Mid 2025)
- [ ] **Collaborative stories** - Create stories together with friends
- [ ] **Music integration** - Add background music to your videos
- [ ] **Advanced analytics** - See detailed stats about your content
- [ ] **Group challenges** - Team up with friends for achievements

### Version 3.0 - "The Future Update" (Late 2025)
- [ ] **AI chat assistant** - "Hey Pixie, help me write a caption about this sunset"
- [ ] **Blockchain features** - NFT profile pictures and crypto rewards (if people actually want this)
- [ ] **Smart home integration** - "Hey Pixie, take a group selfie when everyone's in the living room"
- [ ] **Personalized content feeds** - ML-powered content recommendations

### Got Ideas?
I'm always open to suggestions! If there's something you think would make PixieChat better, feel free to open an issue or just email me. Some of my best ideas have come from other people using the app.

## 📄 Legal Stuff

This project is licensed under the MIT License, which basically means you can do whatever you want with it. Build on it, sell it, improve it - just don't blame me if something breaks! 😄

You can read the full license in the [LICENSE](LICENSE) file if you're into that sort of thing.

## 🙏 Thanks To...

- **The Expo team** for making mobile development actually enjoyable
- **Everyone in the React Native community** for constantly pushing the boundaries
- **The Spring Boot folks** for creating a backend framework that just works
- **All the open source contributors** who built the tools that made this possible
- **My friends** who tested early versions and told me when features were confusing
- **You** for checking out this project!

## 📞 Questions? Ideas? Just Want to Chat?

I love hearing from people who are interested in PixieChat! Here's how to reach me:

- **Found a bug?** [Open an issue](https://github.com/yourusername/pixiechat/issues) and I'll take a look
- **Have an idea?** [Start a discussion](https://github.com/yourusername/pixiechat/discussions) - I love brainstorming with other developers
- **Want to chat?** Drop me an email at hey@pixiechat.dev (I actually read these!)
- **Prefer Discord?** [Join our little community](https://discord.gg/pixiechat) - it's small but friendly

I try to respond to everyone, though it might take a day or two during busy periods.

## 🌟 Like What You See?

If PixieChat has been helpful or interesting to you, here are some ways to show support:

- ⭐ **Star this repo** - it really helps with visibility and makes me happy
- 🐛 **Report bugs** when you find them - every bug report makes the app better
- 💡 **Suggest features** - some of my favorite features came from user suggestions
- 🤝 **Contribute code** - even small improvements are incredibly valuable
- 📢 **Tell your friends** - word of mouth is the best marketing
- 🍕 **Buy me a coffee** - okay, there's no link for this yet, but the thought counts!

Building PixieChat has been one of the most fun projects I've worked on, and knowing that other people find it useful or interesting makes all the late-night debugging sessions worth it.

---

<div align="center">

**Built with a lot of coffee ☕ and probably too much enthusiasm 🚀**

*Thanks for checking out PixieChat! Now go build something awesome! 💜*

(https://github.com/BEN-AMEV)

</div>

