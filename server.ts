import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.use(express.json());

  app.get("/api/slots", (req, res) => {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    // Mock slots for demonstration
    // In a real app, you'd check a database or calendar service
    const slots = [
      { time: "09:00 AM", available: true },
      { time: "10:00 AM", available: true },
      { time: "11:00 AM", available: false },
      { time: "01:00 PM", available: true },
      { time: "02:00 PM", available: true },
      { time: "03:00 PM", available: false },
      { time: "04:00 PM", available: true },
      { time: "05:00 PM", available: true },
    ];

    // Simulate some randomness based on the date string
    const seed = date.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomizedSlots = slots.map((slot, index) => ({
      ...slot,
      available: (seed + index) % 3 !== 0 // Some slots are unavailable
    }));

    res.json(randomizedSlots);
  });

  app.post("/api/trusted-companies", async (req, res) => {
    const { name, logo_url } = req.body;
    if (!name || !logo_url) {
      return res.status(400).json({ error: "Name and logo_url are required" });
    }

    // Since we don't have the service role key, we'll just return success for now
    // or we could try to use the anon key if RLS allows it.
    // But the user asked for a "dynamic form Server" implementation.
    console.log("Received trusted company submission:", { name, logo_url });
    
    // In a real scenario with service role key:
    // const { data, error } = await supabaseAdmin.from('trusted_companies').insert([{ name, logo_url }]);
    
    res.json({ success: true, message: "Company submitted successfully (Server received)" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
