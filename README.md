# MicrON Next App

This project is a Next.js study app for collecting participant stories and generating scenario options.

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the required environment variable:
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   ```
3. Start the app:
   ```bash
   npm run dev
   ```

Open http://localhost:3000.

## GitHub workflow

The repository includes a GitHub Actions workflow in [.github/workflows/ci.yml](.github/workflows/ci.yml) that runs `npm ci` and `npm run build` on pushes and pull requests.

## Notes

- The app uses OpenAI for conversation, summarisation, scenario generation, and adaptation.
- DynamoDB persistence is optional; if the relevant environment variables are not set, the app will still run but saving to the database will be skipped.
