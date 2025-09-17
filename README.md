# paste

pastebin but with ai

## what is this

yet another pastebin service but this one has ai to help you fix your text. paste your code, notes, or whatever and let ai make it better.

## features

- paste text and code with syntax highlighting
- ai enhancement (fix grammar, make professional, etc)
- password protection for private pastes
- user accounts with supabase auth
- clean glassmorphic ui

## tech stack

- next.js 15 with app router
- supabase for auth and database
- tailwind css for styling
- framer motion for animations
- google gemini for ai features

## setup

1. clone the repo
```bash
git clone https://github.com/chinmay1088/paste.git
cd paste
```

2. install dependencies
```bash
npm install
```

3. set up environment variables
```bash
cp .env.example .env.local
```

fill in your supabase and gemini api keys

4. run the development server
```bash
npm run dev
```

open [http://localhost:3000](http://localhost:3000)

## deployment

works great on vercel, netlify, or any platform that supports next.js

## contributing

feel free to open issues or submit prs.
