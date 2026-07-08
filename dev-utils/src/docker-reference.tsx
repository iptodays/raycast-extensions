import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const COMMANDS: { cmd: string; description: string; example: string }[] = [
  { cmd: "docker ps", description: "List running containers", example: "docker ps" },
  { cmd: "docker ps -a", description: "List all containers", example: "docker ps -a" },
  { cmd: "docker images", description: "List images", example: "docker images" },
  { cmd: "docker pull", description: "Pull an image", example: "docker pull nginx:latest" },
  { cmd: "docker build", description: "Build an image", example: "docker build -t myapp:latest ." },
  { cmd: "docker run", description: "Run a container", example: "docker run -d -p 8080:80 --name web nginx" },
  { cmd: "docker run -it", description: "Run interactive", example: "docker run -it ubuntu bash" },
  { cmd: "docker start", description: "Start stopped container", example: "docker start web" },
  { cmd: "docker stop", description: "Stop running container", example: "docker stop web" },
  { cmd: "docker restart", description: "Restart container", example: "docker restart web" },
  { cmd: "docker rm", description: "Remove container", example: "docker rm web" },
  { cmd: "docker rmi", description: "Remove image", example: "docker rmi nginx:latest" },
  { cmd: "docker exec -it", description: "Exec into running container", example: "docker exec -it web bash" },
  { cmd: "docker logs", description: "View container logs", example: "docker logs -f web" },
  { cmd: "docker logs --tail", description: "Tail recent logs", example: "docker logs --tail 100 web" },
  { cmd: "docker cp", description: "Copy files to/from container", example: "docker cp web:/app/log.txt ./" },
  { cmd: "docker inspect", description: "Inspect container/image", example: "docker inspect web" },
  { cmd: "docker stats", description: "Live container stats", example: "docker stats" },
  { cmd: "docker top", description: "Show container processes", example: "docker top web" },
  { cmd: "docker port", description: "List port mappings", example: "docker port web" },
  { cmd: "docker network ls", description: "List networks", example: "docker network ls" },
  { cmd: "docker network create", description: "Create network", example: "docker network create mynet" },
  { cmd: "docker volume ls", description: "List volumes", example: "docker volume ls" },
  { cmd: "docker volume create", description: "Create volume", example: "docker volume create data" },
  { cmd: "docker system prune", description: "Clean up unused resources", example: "docker system prune -af" },
  { cmd: "docker system df", description: "Show disk usage", example: "docker system df" },
  { cmd: "docker save", description: "Save image to tar", example: "docker save myapp > myapp.tar" },
  { cmd: "docker load", description: "Load image from tar", example: "docker load < myapp.tar" },
  { cmd: "docker login", description: "Login to registry", example: "docker login registry.example.com" },
  { cmd: "docker tag", description: "Tag an image", example: "docker tag myapp:latest user/myapp:latest" },
  { cmd: "docker push", description: "Push image to registry", example: "docker push user/myapp:latest" },
  { cmd: "docker compose up", description: "Start services (compose)", example: "docker compose up -d" },
  { cmd: "docker compose down", description: "Stop services (compose)", example: "docker compose down -v" },
  { cmd: "docker compose logs", description: "Compose service logs", example: "docker compose logs -f" },
  { cmd: "docker compose ps", description: "List compose services", example: "docker compose ps" },
  { cmd: "docker compose build", description: "Build compose services", example: "docker compose build" },
  { cmd: "docker compose exec", description: "Exec in compose service", example: "docker compose exec app bash" },
];

export default function DockerReference() {
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
    <Form>
      <Form.TextField
        id="search"
        title="Search"
        placeholder="run, build, compose…"
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
