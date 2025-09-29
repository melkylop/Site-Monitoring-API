const db = require("../database");

class Site {
  // Criar novo site
  static async create(siteData) {
    const { url, check_time, webhook_url } = siteData;
    const result = await db.runAsync(
      "INSERT INTO sites (url, check_time, webhook_url) VALUES (?, ?, ?)",
      [url, check_time, webhook_url]
    );
    return result.lastID;
  }

  // Buscar todos os sites
  static async findAll() {
    return await db.allAsync("SELECT * FROM sites WHERE active = 1");
  }

  // Buscar site por ID
  static async findById(id) {
    return await db.getAsync(
      "SELECT * FROM sites WHERE id = ? AND active = 1",
      [id]
    );
  }

  // Atualizar site
  static async update(id, siteData) {
    const { url, check_time, webhook_url } = siteData;
    await db.runAsync(
      "UPDATE sites SET url = ?, check_time = ?, webhook_url = ? WHERE id = ?",
      [url, check_time, webhook_url, id]
    );
  }

  // "Deletar" site (soft delete)
  static async delete(id) {
    await db.runAsync("UPDATE sites SET active = 0 WHERE id = ?", [id]);
  }
}

module.exports = Site;
