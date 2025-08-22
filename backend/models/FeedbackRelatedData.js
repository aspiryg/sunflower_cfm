import { database, sql } from "../config/database.js";

export class Category {
  static async getAll() {
    const pool = database.getPool();
    const request = pool.request();
    const query = `
      SELECT * FROM FeedbackCategories
    `;
    const result = await request.query(query);
    return result.recordset;
  }

  // static async getById(id) {}

  // static async createCategory(data) {}

  // static async updateCategory(id, data) {}

  // static async deleteCategory(id) {}
}

export class Channel {
  static async getAll() {
    const pool = database.getPool();
    const request = pool.request();
    const query = `
      SELECT * FROM FeedbackChannels
    `;
    const result = await request.query(query);
    return result.recordset;
  }
}

export class Provider {
  static async getAll() {
    const pool = database.getPool();
    const request = pool.request();
    const query = `
      SELECT * FROM ProviderTypes
    `;
    const result = await request.query(query);
    return result.recordset;
  }
}

export class Programme {
  static async getAll() {
    const pool = database.getPool();
    const request = pool.request();
    const query = `
      SELECT * FROM Programmes
    `;
    const result = await request.query(query);
    return result.recordset;
  }
}

export class Project {
  static async getAll() {
    const pool = database.getPool();
    const request = pool.request();
    const query = `
      SELECT * FROM Projects
    `;
    const result = await request.query(query);
    return result.recordset;
  }
}

export class Activity {
  static async getAll() {
    const pool = database.getPool();
    const request = pool.request();
    const query = `
      SELECT * FROM Activities
    `;
    const result = await request.query(query);
    return result.recordset;
  }
}

export class Community {
  static async getAll() {
    const pool = database.getPool();
    const request = pool.request();
    const query = `
      SELECT * FROM Communities
    `;
    const result = await request.query(query);
    return result.recordset;
  }
}
