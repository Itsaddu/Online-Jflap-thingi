import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAutomatonSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/automata", async (req, res) => {
    try {
      const automata = await storage.getAllAutomata();
      res.json(automata);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch automata" });
    }
  });

  app.get("/api/automata/:id", async (req, res) => {
    try {
      const automaton = await storage.getAutomaton(req.params.id);
      if (!automaton) {
        return res.status(404).json({ error: "Automaton not found" });
      }
      res.json(automaton);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch automaton" });
    }
  });

  app.post("/api/automata", async (req, res) => {
    try {
      const parsed = insertAutomatonSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid automaton data", details: parsed.error });
      }
      const automaton = await storage.createAutomaton(parsed.data);
      res.status(201).json(automaton);
    } catch (error) {
      res.status(500).json({ error: "Failed to create automaton" });
    }
  });

  app.put("/api/automata/:id", async (req, res) => {
    try {
      const parsed = insertAutomatonSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid automaton data", details: parsed.error });
      }
      const automaton = await storage.updateAutomaton(req.params.id, parsed.data);
      if (!automaton) {
        return res.status(404).json({ error: "Automaton not found" });
      }
      res.json(automaton);
    } catch (error) {
      res.status(500).json({ error: "Failed to update automaton" });
    }
  });

  app.delete("/api/automata/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAutomaton(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Automaton not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete automaton" });
    }
  });

  return httpServer;
}
