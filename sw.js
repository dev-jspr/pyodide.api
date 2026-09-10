const indexURL = "./"; // load pyodide files from your repo root
importScripts(indexURL + "pyodide.js");

(async () => {
    self.pyodide = await loadPyodide({ indexURL });

    self.addEventListener("fetch", async (event) => {
        const req = event.request;
        const url = new URL(req.url);

        // Handle POST requests (execute Python code)
        if (req.method === "POST") {
            try {
                const body = await req.json();
                const code = body.code;

                if (!code) {
                    return event.respondWith(
                        new Response(
                            JSON.stringify({ error: "No 'code' field provided" }),
                            { status: 400, headers: { "Content-Type": "application/json" } }
                        )
                    );
                }

                const result = await self.pyodide.runPythonAsync(code);
                
                event.respondWith(
                    new Response(
                        JSON.stringify({
                            success: true,
                            output: String(result),
                            code: code
                        }),
                        {
                            status: 200,
                            headers: { "Content-Type": "application/json" }
                        }
                    )
                );
            } catch (err) {
                event.respondWith(
                    new Response(
                        JSON.stringify({
                            success: false,
                            error: String(err),
                            error_type: err.name || "UnknownError"
                        }),
                        {
                            status: 500,
                            headers: { "Content-Type": "application/json" }
                        }
                    )
                );
            }
            return;
        }

        // Handle GET requests (show API info)
        if (req.method === "GET") {
            if (url.pathname === "/api" || url.pathname === "/api/") {
                return event.respondWith(
                    new Response(
                        JSON.stringify({
                            name: "Pyodide Python API",
                            version: "1.0",
                            description: "Execute Python code via HTTP requests",
                            usage: {
                                method: "POST",
                                url: url.origin,
                                headers: { "Content-Type": "application/json" },
                                body: { code: "print('Hello World')" }
                            },
                            examples: {
                                curl: `curl -X POST ${url.origin} \\
  -H "Content-Type: application/json" \\
  -d '{"code": "print(\\"Hello from Python\\")"}'`,
                                python: `import requests
response = requests.post("${url.origin}", json={"code": "2 + 2"})
print(response.json())`,
                                javascript: `fetch("${url.origin}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: "import sys; print(sys.version)" })
}).then(r => r.json()).then(console.log)`
                            }
                        }),
                        {
                            status: 200,
                            headers: { "Content-Type": "application/json" }
                        }
                    )
                );
            }

            // Default fallback
            return event.respondWith(fetch(req));
        }

        // Handle other methods
        event.respondWith(fetch(req));
    });
})();
