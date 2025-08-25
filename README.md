# M3U8 Manager

A modern, web-based IPTV playlist manager built with Next.js and TypeScript. Import, edit, and manage your M3U8 playlists with an intuitive interface.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)

## ✨ Features

- **📁 Import M3U8 Files**: Easily import and parse M3U8 playlist files
- **📺 Channel Management**: Add, edit, and delete channels with full metadata support
- **🏷️ Group Organization**: Filter and organize channels by group titles
- **🔍 Advanced Search**: Search channels by title, group, or TVG ID
- **⚙️ Configuration Support**: Manage playlist configurations including TVG URLs, caching, and more
- **📱 Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **💾 Local Storage**: All data stored locally in your browser
- **🔄 Export Functionality**: Export your playlists back to M3U8 format
- **👀 Multiple View Modes**: Switch between grid and list views

## 🛠️ Technologies

- **Frontend**: [Next.js 15](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://radix-ui.com/) with custom components
- **Icons**: [Lucide React](https://lucide.dev/)
- **Package Manager**: Bun

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (recommended) or npm/yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/nthung2112/nth-m3u8-manager.git
   cd nth-m3u8-manager
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Start the development server**

   ```bash
   bun dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Importing M3U8 Files

1. Click the **"Import M3U8"** button on the home page
2. Select your M3U8 file or paste the content directly
3. The playlist will be parsed and channels will be imported automatically

### Managing Channels

- **Edit Channel**: Click on any channel card to edit its properties
- **Delete Channel**: Use the delete button in the channel editor
- **Add Channel**: Use the "Add Channel" button in the filters section
- **Search**: Use the search bar to find specific channels
- **Filter by Group**: Select a group from the dropdown to filter channels

### Channel Properties

Each channel supports the following properties:

- **Title**: Display name of the channel
- **URL**: Stream URL
- **TVG ID**: Electronic Program Guide identifier
- **TVG Logo**: Channel logo URL
- **Group Title**: Category/group name
- **Catchup**: Catchup service configuration
- **User Agent**: Custom HTTP user agent
- **Referrer**: HTTP referrer header

### Configuration Management

The application supports M3U8 playlist configurations:

- **URL-TVG**: EPG data source URL
- **TVG-Shift**: Time zone shift for EPG data
- **Refresh**: Auto-refresh interval
- **Cache**: Cache duration settings
- **Interlace**: Video interlacing settings
- **Aspect Ratio**: Default aspect ratio
- **M3U Auto-load**: Auto-loading behavior

## 📁 Project Structure

```
nth-m3u8-manager/
├── app/                          # Next.js app directory
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Home page
│   └── playlist/
│       └── [id]/
│           └── page.tsx         # Playlist management page
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── playlist/                # Playlist-specific components
│   ├── channel-editor-dialog.tsx
│   └── import-dialog.tsx
├── lib/                         # Utility functions and types
│   ├── m3u8-parser.ts          # M3U8 parsing and generation
│   ├── storage.ts              # Local storage utilities
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # General utilities
├── public/                      # Static assets
└── styles/                      # Additional stylesheets
```

## 🔧 Development

### Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint

### Building for Production

```bash
bun build
bun start
```

## 📝 M3U8 Format Support

The parser supports standard M3U8 format with the following directives:

### Headers

- `#EXTM3U` - Playlist header with optional configuration parameters

### Channel Information

- `#EXTINF` - Channel information line with metadata
- `#EXTVLCOPT` - VLC-specific options

### Supported Attributes

- `tvg-id` - Electronic Program Guide ID
- `tvg-logo` - Channel logo URL
- `group-title` - Channel group/category
- `catchup` - Catchup service configuration
- `catchup-days` - Number of catchup days
- `catchup-source` - Catchup source URL
- `http-user-agent` - Custom user agent
- `http-referrer` - HTTP referrer

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Hung Nguyen** ([@nthung2112](https://github.com/nthung2112))

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://radix-ui.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 🔗 Links

- [Repository](https://github.com/nthung2112/nth-m3u8-manager)
- [Issues](https://github.com/nthung2112/nth-m3u8-manager/issues)
- [Discussions](https://github.com/nthung2112/nth-m3u8-manager/discussions)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/nthung2112">Hung Nguyen</a>
</div>
