import type { FeedbackStatus } from "@/entities/feedback/contracts";

export const demoProduct = {
  name: "Orbit CLI",
  description:
    "Orbit CLI is a deploy tool for small teams. Tell us what is missing and vote on what matters most — the roadmap follows the votes.",
};

export const demoAuthors = [
  "Marta K.",
  "Dmytro S.",
  "Ren Okafor",
  "Olena V.",
  "Sam Patel",
  "Ines Moreau",
  "Tomasz W.",
  "Aiko Tanaka",
] as const;

type DemoAuthor = (typeof demoAuthors)[number];

type DemoFeedback = {
  title: string;
  body: string;
  status: FeedbackStatus;
  author: DemoAuthor;
  daysAgo: number;
  // Only for a completed item, and fewer days ago than it was posted.
  completedDaysAgo?: number;
  // The author's own vote included.
  votes: number;
};

export const demoFeedback: readonly DemoFeedback[] = [
  {
    title: "Watch mode that survives a failed build",
    body: "Right now a syntax error kills the watcher and I have to restart the whole thing. It should log the error and keep watching the file tree.\n\nOn a large monorepo the restart takes about forty seconds, which makes watch mode slower than running the build by hand.",
    status: "open",
    author: "Marta K.",
    daysAgo: 75,
    votes: 128,
  },
  {
    title: "Dry run that prints every change before a deploy",
    body: "Show which files would be uploaded and which environment variables would change, then stop. I want to paste the output into a review before anything goes out.",
    status: "open",
    author: "Ines Moreau",
    daysAgo: 40,
    votes: 57,
  },
  {
    title: "Deploy from a subdirectory of a monorepo",
    body: "Our app lives in apps/web. Orbit uploads the whole repository and then fails to find the build output. A root option in the config would do.",
    status: "open",
    author: "Tomasz W.",
    daysAgo: 62,
    votes: 52,
  },
  {
    title: "Health check before switching traffic",
    body: "Call a URL on the new release and only switch traffic when it answers 200. Today a release that crashes on boot takes the site down until someone notices.",
    status: "open",
    author: "Ren Okafor",
    daysAgo: 55,
    votes: 46,
  },
  {
    title: "Post to a Slack channel when a deploy finishes",
    body: "Who deployed, which release, and whether it worked. We currently copy it by hand into #releases.",
    status: "open",
    author: "Sam Patel",
    daysAgo: 50,
    votes: 41,
  },
  {
    title: "Resume a failed upload instead of starting over",
    body: "On a slow connection an upload of a few hundred megabytes fails near the end about once a week, and the retry sends everything again.",
    status: "open",
    author: "Aiko Tanaka",
    daysAgo: 45,
    votes: 37,
  },
  {
    title: "Show how long each deploy step took",
    body: "A summary at the end with build, upload and switch times would tell us where the eight minutes go.",
    status: "open",
    author: "Dmytro S.",
    daysAgo: 33,
    votes: 33,
  },
  {
    title: "Windows support without WSL",
    body: "Half of our contractors are on Windows. Everything works under WSL, but the install guide loses people at that step.",
    status: "open",
    author: "Olena V.",
    daysAgo: 70,
    votes: 29,
  },
  {
    title: "A --quiet flag for CI logs",
    body: "Progress bars turn into thousands of lines in CI. Print errors and the final release URL, nothing else.",
    status: "open",
    author: "Marta K.",
    daysAgo: 27,
    votes: 24,
  },
  {
    title: "Respect NO_COLOR",
    body: "Colour codes end up in our log viewer as escape sequences. Most tools turn colour off when NO_COLOR is set.",
    status: "open",
    author: "Ren Okafor",
    daysAgo: 20,
    votes: 18,
  },
  {
    title: "Read the config from orbit.toml as well",
    body: "Everything else in our repository is TOML. YAML is fine, but a second format would save a context switch.",
    status: "open",
    author: "Ines Moreau",
    daysAgo: 12,
    votes: 9,
  },
  {
    title: "Export the deploy history as JSON",
    body: "We want to chart deploy frequency per team. orbit history prints a table that is hard to parse.",
    status: "open",
    author: "Sam Patel",
    daysAgo: 5,
    votes: 6,
  },
  {
    title: "Per-environment secrets in the config file",
    body: "One block per environment instead of a separate file each. Staging and production drift apart constantly.",
    status: "planned",
    author: "Dmytro S.",
    daysAgo: 80,
    votes: 96,
  },
  {
    title: "Deploy previews for pull requests",
    body: "A temporary release for each pull request, with its URL posted on the pull request and removed when it closes.",
    status: "planned",
    author: "Aiko Tanaka",
    daysAgo: 85,
    votes: 71,
  },
  {
    title: "Refuse a second deploy while one is running",
    body: "Two people deployed within a minute of each other and the second release overwrote half of the first. A lock with a clear message would have stopped it.",
    status: "planned",
    author: "Tomasz W.",
    daysAgo: 66,
    votes: 39,
  },
  {
    title: "Support for Bun projects",
    body: "Detect bun.lock and run the build with Bun instead of failing on a missing package-lock.json.",
    status: "planned",
    author: "Olena V.",
    daysAgo: 30,
    votes: 22,
  },
  {
    title: "A status badge for the README",
    body: "An image that shows the last deploy and whether it worked, like the CI badges we already have.",
    status: "planned",
    author: "Marta K.",
    daysAgo: 38,
    votes: 15,
  },
  {
    title: "Rollback to a named release, not just the previous one",
    body: "We tag releases already; let me roll back to a tag by name.",
    status: "in_progress",
    author: "Ren Okafor",
    daysAgo: 90,
    votes: 61,
  },
  {
    title: "Skip unchanged files when uploading",
    body: "Most deploys change a handful of files, yet every upload sends the whole build. Comparing hashes first would cut our deploys from minutes to seconds.",
    status: "in_progress",
    author: "Sam Patel",
    daysAgo: 95,
    votes: 58,
  },
  {
    title: "A clear error when the API token has expired",
    body: "Today an expired token fails with 'unexpected response 401' halfway through a deploy. Say that the token expired and how to make a new one, before anything uploads.",
    status: "in_progress",
    author: "Ines Moreau",
    daysAgo: 47,
    votes: 27,
  },
  {
    title: "Environment variables from a .env file",
    body: "Load a .env file next to the config, so local values do not have to be exported in every shell.",
    status: "completed",
    author: "Aiko Tanaka",
    daysAgo: 110,
    completedDaysAgo: 75,
    votes: 53,
  },
  {
    title: "Shell completions for zsh and fish",
    body: "Completions for commands and flags. The bash ones work well; zsh and fish users get nothing.",
    status: "completed",
    author: "Olena V.",
    daysAgo: 120,
    completedDaysAgo: 60,
    votes: 44,
  },
  {
    title: "Follow the logs with orbit logs --follow",
    body: "Keep printing new log lines until I stop it, like tail -f, instead of printing the last hundred and exiting.",
    status: "completed",
    author: "Dmytro S.",
    daysAgo: 100,
    completedDaysAgo: 40,
    votes: 35,
  },
  {
    title: "Deploy to more than one region at once",
    body: "We run in two regions and deploy twice. One command with a list of regions, failing as a whole if either fails.",
    status: "completed",
    author: "Tomasz W.",
    daysAgo: 105,
    completedDaysAgo: 20,
    votes: 31,
  },
];
