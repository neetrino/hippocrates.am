import { createServer } from "node:http";

const port = 4100;

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const role = roleFromCookie(request.headers.cookie);

  if (url.pathname === "/api/v1/auth/me") {
    if (!role) return json(response, 401, { error: { code: "UNAUTHENTICATED" } });
    return json(response, 200, {
      data: {
        id: `e2e-${role.toLowerCase()}`,
        role,
        clinicId: role === "ADMIN" ? "e2e-clinic" : null,
        displayName: `E2E ${role}`,
        email: `${role.toLowerCase()}@e2e.test`,
        phone: null,
        photoUrl: null,
        emailVisitNotices: true,
      },
    });
  }

  if (url.pathname === "/api/v1/platform/summary") {
    return json(response, 200, {
      data: { clinics: 0, pendingQuestions: 0, publishedDoctors: 0, pendingReviews: 0 },
    });
  }

  if (url.pathname.endsWith("/dashboard")) {
    return json(response, 200, { data: { pending: 0, today: 0, patientCount: 0 } });
  }

  return json(response, 200, { data: [] });
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`E2E mock API listening on http://127.0.0.1:${port}\n`);
});

function roleFromCookie(cookie = "") {
  const match = cookie.match(/(?:^|;\s*)e2e_role=(SUPER_ADMIN|ADMIN|DOCTOR|PATIENT)(?:;|$)/);
  return match?.[1] ?? null;
}

function json(response, status, body) {
  response.writeHead(status, {
    "access-control-allow-origin": "http://127.0.0.1:3000",
    "content-type": "application/json",
  });
  response.end(JSON.stringify(body));
}
