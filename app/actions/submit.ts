"use server";

import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { ProjectStatic } from "@/lib/types";

const GITHUB_OWNER = "AlesixDev";
const GITHUB_REPO = "github-projects";
const PROJECTS_PATH = "data/projects.json";
const BASE_BRANCH = "main";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

let ratelimit: Ratelimit | null = null;
function getRatelimit() {
  if (
    !ratelimit &&
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "24 h"),
      prefix: "projects:submit",
    });
  }
  return ratelimit;
}

export type SubmitState = {
  success?: boolean;
  prUrl?: string;
  error?: string;
} | null;

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseGitHubUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { error: "GitHub URL must be a valid URL." };
  }

  const parts = url.pathname.replace(/^\//, "").split("/");
  if (url.hostname !== "github.com" || parts.length < 2) {
    return {
      error: "URL must point to a GitHub repository (github.com/owner/repo).",
    };
  }
  return { owner: parts[0], repo: parts[1] };
}

function ghHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  } as const;
}

const GH_PUBLIC_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
} as const;

async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json();
  return data.success === true;
}

export async function submitProject(
  _prevState: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const name = (formData.get("name") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim();
  const github_url = (formData.get("github_url") as string | null)?.trim();
  const demo_url =
    (formData.get("demo_url") as string | null)?.trim() || undefined;
  const tagsRaw = (formData.get("tags") as string | null)?.trim();
  const cfToken = (
    formData.get("cf-turnstile-response") as string | null
  )?.trim();

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    "anonymous";

  // Validate the Cloudflare Turnstile token server-side to block bots.
  // Skipped entirely in local dev when TURNSTILE_SECRET_KEY is absent.
  if (process.env.TURNSTILE_SECRET_KEY) {
    if (!cfToken) return { error: "Bot verification failed. Please retry." };
    const valid = await verifyTurnstile(cfToken, ip);
    if (!valid) return { error: "Bot verification failed. Please retry." };
  }

  // Enforce per-IP sliding-window rate limit (3 submissions / 24h) via Upstash Redis.
  // Degrades gracefully: if Redis env vars are missing, no limit is applied.
  const rl = getRatelimit();
  if (rl) {
    const { success, reset } = await rl.limit(ip);
    if (!success) {
      const hours = Math.ceil((reset - Date.now()) / 3_600_000);
      return {
        error: `Too many submissions from your IP. Try again in ~${hours}h.`,
      };
    }
  }

  // Require the minimum fields needed to create a valid showcase entry.
  if (!name) return { error: "Project name is required." };
  if (!description) return { error: "Description is required." };
  if (!github_url) return { error: "GitHub URL is required." };

  const parsed = parseGitHubUrl(github_url);
  if ("error" in parsed) return { error: parsed.error };
  const { owner: repoOwner, repo: repoName } = parsed;

  const githubToken = process.env.GH_TOKEN;
  if (!githubToken)
    return { error: "Server misconfiguration: missing GitHub token." };

  const authHeaders = ghHeaders(githubToken);

  // Fetch stars & language from the submitted repo. Uses unauthenticated headers
  // so a misconfigured GH_TOKEN never blocks public repo lookups.
  const repoRes = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}`,
    { headers: GH_PUBLIC_HEADERS },
  );
  if (!repoRes.ok) {
    return {
      error: `Could not find repo ${repoOwner}/${repoName} (${repoRes.status}). Is it public?`,
    };
  }
  const repoData = await repoRes.json();
  const stars: number = repoData.stargazers_count ?? 0;
  const language: string = repoData.language ?? "Unknown";

  // Pull the current projects.json from the target repo so we can append to it.
  const fileRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PROJECTS_PATH}`,
    { headers: authHeaders },
  );
  if (!fileRes.ok)
    return { error: "Could not read the projects list from the repository." };

  const fileData = await fileRes.json();
  const currentProjects: ProjectStatic[] = JSON.parse(
    Buffer.from(fileData.content as string, "base64").toString("utf-8"),
  );

  const projectId = `${repoOwner}-${repoName}`;
  if (currentProjects.some((p) => p.id === projectId))
    return { error: "This project is already in the showcase." };

  // Build a ProjectStatic entry (only static metadata — live data like stars is fetched at render).
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const newProject: ProjectStatic = {
    id: projectId,
    name,
    description,
    github_url,
    ...(demo_url && { demo_url }),
    tags,
  };

  const updatedProjects = [...currentProjects, newProject];
  const updatedContent = Buffer.from(
    JSON.stringify(updatedProjects, null, 2) + "\n",
  ).toString("base64");

  // Resolve HEAD of main so we can branch off it for the submission PR.
  const refRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/ref/heads/${BASE_BRANCH}`,
    { headers: authHeaders },
  );
  if (!refRes.ok)
    return { error: "Could not read the repository's main branch." };
  const {
    object: { sha: mainSha },
  } = await refRes.json();

  // Create an isolated branch per submission to avoid conflicts between concurrent PRs.
  const branchName = `project-submission/${slugify(repoOwner)}-${slugify(repoName)}-${Date.now()}`;
  const branchRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs`,
    {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: mainSha }),
    },
  );
  if (!branchRes.ok) return { error: "Failed to create a submission branch." };

  // Push the updated projects.json with the new entry to the submission branch.
  const commitRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PROJECTS_PATH}`,
    {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        message: `feat: add project ${name} (${repoOwner}/${repoName})`,
        content: updatedContent,
        sha: fileData.sha,
        branch: branchName,
      }),
    },
  );
  if (!commitRes.ok)
    return { error: "Failed to commit the project to the branch." };

  // Open a PR with a structured body so maintainers can review before merging.
  const prBody = [
    "## New Project Submission",
    "",
    `**Name:** [${name}](${github_url})`,
    `**Author:** ${repoOwner}`,
    `**Description:** ${description}`,
    `**Language:** ${language}`,
    `**Stars:** ${stars.toLocaleString()}`,
    demo_url ? `**Demo:** ${demo_url}` : null,
    tags.length ? `**Tags:** ${tags.join(", ")}` : null,
    "",
    "---",
    "",
    "**Review checklist:**",
    "- [ ] Project is genuinely open-source",
    "- [ ] Description is accurate and well-written",
    "- [ ] Tags are relevant",
    "- [ ] No duplicate of an existing entry",
    "",
    "> Merging this PR will automatically add the project and trigger a Vercel redeploy.",
  ]
    .filter((l) => l !== null)
    .join("\n");

  const prRes = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls`,
    {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        title: `[Project Submission] ${name}`,
        body: prBody,
        head: branchName,
        base: BASE_BRANCH,
      }),
    },
  );
  if (!prRes.ok) {
    const prErr = await prRes.json().catch(() => ({}));
    return {
      error: `Failed to open PR: ${prErr.message ?? prRes.statusText}`,
    };
  }

  const pr = await prRes.json();
  return { success: true, prUrl: pr.html_url };
}
