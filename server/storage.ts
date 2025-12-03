import { type Automaton, type InsertAutomaton } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAutomaton(id: string): Promise<Automaton | undefined>;
  getAllAutomata(): Promise<Automaton[]>;
  createAutomaton(automaton: InsertAutomaton): Promise<Automaton>;
  updateAutomaton(id: string, automaton: InsertAutomaton): Promise<Automaton | undefined>;
  deleteAutomaton(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private automata: Map<string, Automaton>;

  constructor() {
    this.automata = new Map();
  }

  async getAutomaton(id: string): Promise<Automaton | undefined> {
    return this.automata.get(id);
  }

  async getAllAutomata(): Promise<Automaton[]> {
    return Array.from(this.automata.values());
  }

  async createAutomaton(insertAutomaton: InsertAutomaton): Promise<Automaton> {
    const id = randomUUID();
    const automaton: Automaton = { ...insertAutomaton, id };
    this.automata.set(id, automaton);
    return automaton;
  }

  async updateAutomaton(id: string, insertAutomaton: InsertAutomaton): Promise<Automaton | undefined> {
    if (!this.automata.has(id)) {
      return undefined;
    }
    const automaton: Automaton = { ...insertAutomaton, id };
    this.automata.set(id, automaton);
    return automaton;
  }

  async deleteAutomaton(id: string): Promise<boolean> {
    return this.automata.delete(id);
  }
}

export const storage = new MemStorage();
