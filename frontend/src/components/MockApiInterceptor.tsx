"use client";

import { useEffect, useState } from "react";
import { handleMockRequest } from "@/lib/mockDatabase";

export function MockApiInterceptor() {
  const [isMockActive, setIsMockActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;

    window.fetch = async function (input, init) {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.toString()
          : (input as Request).url;

      // Only intercept POST requests to our Spring Boot pipeline endpoint
      if (url.includes("/api/v1/tables/fetch") && init?.method === "POST") {
        try {
          // Attempt the real fetch first
          const response = await originalFetch.apply(this, arguments as any);
          
          // If the network call succeeds but has a bad status or something, 
          // we still let it return the real response.
          return response;
        } catch (err) {
          // Connection failed (backend is not running or unreachable)
          console.warn("Spring Boot backend offline. Intercepting query and falling back to mock database.", err);
          
          setIsMockActive(true);

          try {
            // Extract the body and header details
            const bodyStr = init?.body ? init.body.toString() : "{}";
            const body = JSON.parse(bodyStr);

            // Extract the user role header
            let activeRole = "STANDARD_USER";
            if (init?.headers) {
              if (init.headers instanceof Headers) {
                activeRole = init.headers.get("X-User-Role") || "STANDARD_USER";
              } else if (Array.isArray(init.headers)) {
                const found = init.headers.find(([k]) => k.toLowerCase() === "x-user-role");
                if (found) activeRole = found[1];
              } else {
                const headersObj = init.headers as Record<string, string>;
                const key = Object.keys(headersObj).find((k) => k.toLowerCase() === "x-user-role");
                if (key) activeRole = headersObj[key];
              }
            }

            // Process query client-side
            const result = handleMockRequest(body, activeRole);

            // Return a mocked Response
            return new Response(JSON.stringify(result), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            });
          } catch (mockErr) {
            console.error("Failed to compile mock database query result:", mockErr);
            // Fallback to empty data structure rather than throwing
            return new Response(JSON.stringify({ data: [], totalCount: 0 }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
        }
      }

      // Default pass-through for other fetches
      return originalFetch.apply(this, arguments as any);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!isMockActive) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 shadow-2xl text-slate-100 select-none transition-all duration-300 hover:bg-slate-900/90"
      style={{
        boxShadow: "0 10px 30px -10px rgba(6, 182, 212, 0.3)",
      }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
      </span>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider font-sans leading-none text-cyan-400">
          Demo Mode
        </span>
        <span className="text-[8px] font-semibold text-slate-400 font-sans tracking-wide mt-0.5 leading-none">
          Spring Boot Database Offline
        </span>
      </div>
    </div>
  );
}
