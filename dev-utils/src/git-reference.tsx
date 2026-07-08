import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const COMMANDS: { cmd: string; description: string; example: string }[] = [
  { cmd: "git init", description: "Initialize a new repo", example: "git init" },
  { cmd: "git clone", description: "Clone a remote repository", example: "git clone https://github.com/user/repo.git" },
  { cmd: "git add", description: "Stage changes for commit", example: "git add ." },
  { cmd: "git rm", description: "Remove file from tracking", example: "git rm --cached file.txt" },
  { cmd: "git commit", description: "Commit staged changes", example: "git commit -m \"feat: add login\"" },
  { cmd: "git commit --amend", description: "Amend last commit", example: "git commit --amend -m \"new message\"" },
  { cmd: "git push", description: "Push commits to remote", example: "git push origin main" },
  { cmd: "git push -u", description: "Push and set upstream", example: "git push -u origin feature/xyz" },
  { cmd: "git push --force", description: "Force push (careful!)", example: "git push --force-with-lease origin main" },
  { cmd: "git pull", description: "Pull from remote and merge", example: "git pull origin main" },
  { cmd: "git fetch", description: "Fetch remote changes", example: "git fetch origin" },
  { cmd: "git status", description: "Show working tree status", example: "git status" },
  { cmd: "git log", description: "Show commit log", example: "git log --oneline --graph --decorate -10" },
  { cmd: "git log --all", description: "Show all branches log", example: "git log --oneline --all" },
  { cmd: "git diff", description: "Show unstaged changes", example: "git diff" },
  { cmd: "git diff --staged", description: "Show staged changes", example: "git diff --staged" },
  { cmd: "git diff branch1...branch2", description: "Compare branches", example: "git diff main...feature" },
  { cmd: "git branch", description: "List branches", example: "git branch" },
  { cmd: "git branch -d", description: "Delete a branch", example: "git branch -d old-branch" },
  { cmd: "git checkout -b", description: "Create and switch branch", example: "git checkout -b feature/xyz" },
  { cmd: "git switch", description: "Switch branch", example: "git switch feature/xyz" },
  { cmd: "git merge", description: "Merge a branch", example: "git merge feature/xyz" },
  { cmd: "git rebase", description: "Rebase onto another branch", example: "git rebase main" },
  { cmd: "git rebase -i", description: "Interactive rebase", example: "git rebase -i HEAD~3" },
  { cmd: "git stash", description: "Stash changes", example: "git stash push -m \"wip\"" },
  { cmd: "git stash pop", description: "Apply and drop stash", example: "git stash pop" },
  { cmd: "git stash list", description: "List stash entries", example: "git stash list" },
  { cmd: "git tag", description: "List tags", example: "git tag -l \"v*\"" },
  { cmd: "git tag -a", description: "Create annotated tag", example: "git tag -a v1.0 -m \"Release 1.0\"" },
  { cmd: "git reset", description: "Unstage files (keep)", example: "git reset HEAD file.txt" },
  { cmd: "git reset --hard", description: "Discard changes (careful!)", example: "git reset --hard HEAD" },
  { cmd: "git revert", description: "Revert a commit", example: "git revert HEAD" },
  { cmd: "git cherry-pick", description: "Apply specific commit", example: "git cherry-pick abc123" },
  { cmd: "git grep", description: "Search in files", example: "git grep \"TODO\" -- src/" },
  { cmd: "git blame", description: "Who changed each line", example: "git blame src/index.ts" },
  { cmd: "git bisect", description: "Binary search for bugs", example: "git bisect start" },
  { cmd: "git clean -fd", description: "Remove untracked files", example: "git clean -fd" },
  { cmd: "git submodule", description: "Manage submodules", example: "git submodule update --init --recursive" },
  { cmd: "git remote -v", description: "Show remote URLs", example: "git remote -v" },
  { cmd: "git remote add", description: "Add remote origin", example: "git remote add origin https://github.com/user/repo.git" },
  { cmd: "git config --global", description: "Set global config", example: "git config --global user.name \"Your Name\"" },
  { cmd: "git config --list", description: "List all config values", example: "git config --list" },
  { cmd: "git shortlog", description: "Summarize commits by author", example: "git shortlog -sn" },
  { cmd: "git reflog", description: "Show reference log", example: "git reflog" },
  { cmd: "git archive", description: "Create archive of repo", example: "git archive --format=zip HEAD > repo.zip" },
];

export default function GitReference() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search.trim()
        ? COMMANDS.filter(
            (c) =>
              c.cmd.toLowerCase().includes(search.toLowerCase()) ||
              c.description.toLowerCase().includes(search.toLowerCase())
          )
        : COMMANDS,
    [search]
  );

  return (
    <Form
      actions={
        <ActionPanel>
          {filtered.length === 1 && (
            <Action
              title="Copy Command"
              icon={Icon.Clipboard}
              onAction={async () => {
                await Clipboard.copy(`${filtered[0]!.cmd}  # ${filtered[0]!.description}\n${filtered[0]!.example}`);
                showToast(Toast.Style.Success, "Copied to clipboard");
              }}
            />
          )}
        </ActionPanel>
      }
    >
      <Form.TextField
        id="search"
        title="Search"
        placeholder="commit, branch, merge…"
        value={search}
        onChange={setSearch}
      />
      {filtered.slice(0, 100).map((c) => (
        <Form.Description key={c.cmd} title={c.cmd} text={`${c.description}  (e.g. ${c.example})`} />
      ))}
      {filtered.length > 100 && <Form.Description title="" text={`… and ${filtered.length - 100} more`} />}
    </Form>
  );
}
