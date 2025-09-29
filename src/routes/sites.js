const express = require("express");
const Site = require("../models/Site");
const SiteCheck = require("../models/SiteCheck");

const router = express.Router();

// GET - Listar todos os sites
router.get("/", async (req, res) => {
  try {
    const sites = await Site.findAll();
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Buscar site por ID
router.get("/:id", async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ error: "Site não encontrado" });
    }
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Criar novo site
router.post("/", async (req, res) => {
  try {
    const { url, check_time, webhook_url } = req.body;

    if (!url || !check_time) {
      return res
        .status(400)
        .json({ error: "URL e check_time são obrigatórios" });
    }

    const siteId = await Site.create({ url, check_time, webhook_url });
    res.status(201).json({ id: siteId, message: "Site criado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Atualizar site
router.put("/:id", async (req, res) => {
  try {
    await Site.update(req.params.id, req.body);
    res.json({ message: "Site atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Remover site
router.delete("/:id", async (req, res) => {
  try {
    await Site.delete(req.params.id);
    res.json({ message: "Site removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Histórico de checks de um site
router.get("/:id/checks", async (req, res) => {
  try {
    const checks = await SiteCheck.findBySiteId(req.params.id);
    res.json(checks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Forçar check manual
router.post("/:id/check", async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ error: "Site não encontrado" });
    }

    const { siteMonitor } = require("../utils/monitor");
    await siteMonitor.checkSite(site);

    res.json({ message: "Check realizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
