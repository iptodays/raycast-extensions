import { useState, useMemo } from "react";
import { Form, ActionPanel, Action, Clipboard, showToast, Toast, Icon } from "@raycast/api";

const STATUS_CODES: Record<number, { title: string; description: string }> = {
  100: { title: "Continue", description: "The server has received the request headers and the client should proceed to send the request body." },
  101: { title: "Switching Protocols", description: "The requester has asked the server to switch protocols and the server has agreed." },
  200: { title: "OK", description: "Standard response for successful HTTP requests." },
  201: { title: "Created", description: "The request has been fulfilled, resulting in the creation of a new resource." },
  202: { title: "Accepted", description: "The request has been accepted for processing, but the processing has not been completed." },
  204: { title: "No Content", description: "The server successfully processed the request and is not returning any content." },
  301: { title: "Moved Permanently", description: "The requested resource has been moved to a new URL permanently." },
  302: { title: "Found", description: "The requested resource resides temporarily under a different URL." },
  304: { title: "Not Modified", description: "Indicates the resource has not been modified since the version specified by If-Modified-Since." },
  400: { title: "Bad Request", description: "The server cannot process the request due to a client error." },
  401: { title: "Unauthorized", description: "Authentication is required and has failed or has not been provided." },
  403: { title: "Forbidden", description: "The request was valid, but the server is refusing action." },
  404: { title: "Not Found", description: "The requested resource could not be found." },
  405: { title: "Method Not Allowed", description: "The request method is not supported for the requested resource." },
  408: { title: "Request Timeout", description: "The server timed out waiting for the request." },
  409: { title: "Conflict", description: "Indicates that the request could not be processed because of conflict in the request." },
  410: { title: "Gone", description: "The requested resource is no longer available and will not be available again." },
  413: { title: "Payload Too Large", description: "The request is larger than the server is willing or able to process." },
  415: { title: "Unsupported Media Type", description: "The request entity has a media type which the server does not support." },
  422: { title: "Unprocessable Entity", description: "The request was well-formed but was unable to be followed due to semantic errors." },
  429: { title: "Too Many Requests", description: "The user has sent too many requests in a given amount of time." },
  500: { title: "Internal Server Error", description: "A generic error message when an unexpected condition was encountered." },
  502: { title: "Bad Gateway", description: "The server received an invalid response from the upstream server." },
  503: { title: "Service Unavailable", description: "The server is currently unavailable (overloaded or down for maintenance)." },
  504: { title: "Gateway Timeout", description: "The server did not receive a timely response from the upstream server." },
};

export default function HttpStatus() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return Object.entries(STATUS_CODES)
      .filter(([code, info]) => {
        const q = search.toLowerCase();
        return (
          code.includes(search) ||
          info.title.toLowerCase().includes(q) ||
          info.description.toLowerCase().includes(q)
        );
      })
      .map(([code, info]) => ({
        code: Number(code),
        ...info,
        category:
          code.startsWith("1") ? "1xx Informational" :
          code.startsWith("2") ? "2xx Success" :
          code.startsWith("3") ? "3xx Redirection" :
          code.startsWith("4") ? "4xx Client Error" :
          "5xx Server Error",
      }));
  }, [search]);

  return (
    <Form
      actions={
        <ActionPanel>
          {filtered.length === 1 && (
            <Action
              title="Copy Description"
              icon={Icon.Clipboard}
              onAction={async () => {
                await Clipboard.copy(`${filtered[0]!.code} ${filtered[0]!.title}: ${filtered[0]!.description}`);
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
        placeholder="Code or name…"
        value={search}
        onChange={setSearch}
      />
      {filtered.map((s) => (
        <Form.Description
          key={s.code}
          title={`${s.code} ${s.title}`}
          text={`${s.category} — ${s.description}`}
        />
      ))}
    </Form>
  );
}
