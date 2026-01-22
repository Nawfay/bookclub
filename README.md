# Book Club

A full-stack Next.js application for tracking book club reading progress, managing sessions, and sharing notes. This project uses PocketBase for the backend and OpenLibrary for fetching book data.

<div align="center">
  <video src="https://i.imgur.com/rUyxil8.mp4" width="100%" />
  <img src="https://i.imgur.com/rUyxil8.gif" alt="Book Club App Demo" width="100%">
</div>

## Features

- **Library Management**: View books by status (Currently Reading, Up Next, Completed). Search and add books using the OpenLibrary API or upload custom entries with cover images.
- **Reading Sessions**: Create shared reading goals with target pages, chapters, and completion dates. Join active sessions to track progress.
- **Progress Tracking**: Track individual member progress and status (Reading, Completed, Dropped).
- **Community Notes**: Post, share, and search for notes on specific books.
- **Visuals & UX**: Includes dark/light mode support and responsive design.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide React, Sonner
- **Backend**: PocketBase
- **API**: OpenLibrary

## Preview

[![Watch the video](https://i.imgur.com/rUyxil8.gif)](https://i.imgur.com/rUyxil8.mp4)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A running instance of PocketBase

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/bookclub.git](https://github.com/yourusername/bookclub.git)
   cd bookclub
