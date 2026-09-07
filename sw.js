const indexURL = "./"; // load pyodide files from your repo root
importScripts(indexURL + "pyodide.js");

(async () => {
    self.pyodide = await loadPyodide({ indexURL });

    self.addEventListener("fetch", async event => {
        const req = event.request;

        if (req.method === "POST") {
            try {
                const body = await req.json();
                const result = await self.pyodide.runPythonAsync(body.code);
                event.respondWith(new Response(String(result)));
            } catch (err) {
                event.respondWith(new Response(String(err), { status: 500 }));
            }
            return;
        }

        event.respondWith(fetch(req));
    });
})();
