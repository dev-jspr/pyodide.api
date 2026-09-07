self.addEventListener("fetch", async event => {
    const request = event.request;

    if (request.method === "POST") {
        const body = await request.json();
        const code = body.code;

        // Run Python using Pyodide inside the service worker
        const result = await self.pyodide.runPythonAsync(code);

        event.respondWith(new Response(result));
        return;
    }

    event.respondWith(fetch(request));
});
