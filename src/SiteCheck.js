const db = require("../database");

class SiteCheck {
  // Salvar resultado do check
  static async create(checkData) {
    const {
      site_id,
      response_time,
      status_code,
      error_message,
      response_headers,
      response_body,
      success,
    } = checkData;

    await db.runAsync(
      `INSERT INTO site_checks (site_id, response_time, status_code, error_message, response_headers, response_body, success) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        site_id,
        response_time,
        status_code,
        error_message,
        response_headers,
        response_body,
        success,
      ]
    );
  }

  // Buscar checks por site
  static async findBySiteId(siteId) {
    return await db.allAsync(
      "SELECT * FROM site_checks WHERE site_id = ? ORDER BY check_timestamp DESC LIMIT 100",
      [siteId]
    );
  }
}

module.exports = SiteCheck;
