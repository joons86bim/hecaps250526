const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_DIR = path.resolve(__dirname, "../data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function safeFileName(urn) {
  // 모든 특수문자를 _로 변환 (강추)
  return String(urn).replace(/[^a-zA-Z0-9]/g, "_");
}

router.get('/api/tasks', (req, res) => {
  const urn = req.query.urn;
  if (!urn) return res.status(400).json({ error: "URN required" });
  //const safeUrn = encodeURIComponent(urn);
  //const filePath = path.join(DATA_DIR, `${safeUrn}.json`);
  const filePath = path.join(DATA_DIR, `${safeFileName(urn)}.json`);
  console.log("[GET] 불러오기 시도:", urn, "->", filePath);
  if (!fs.existsSync(filePath)) return res.json([]);
  try {
    const json = fs.readFileSync(filePath, "utf8");
    res.json(JSON.parse(json));
  } catch (err) {
    console.error("파일 읽기 오류", err);
    res.status(500).json({ error: "파일 읽기 오류", detail: err.message });
  }
});

router.post('/api/tasks', (req, res) => {
  const urn = req.query.urn;
  if (!urn) return res.status(400).json({ error: "URN required" });
  //const safeUrn = encodeURIComponent(urn);
  //const filePath = path.join(DATA_DIR, `${safeUrn}.json`);
  const filePath = path.join(DATA_DIR, `${safeFileName(urn)}.json`);
  console.log("[POST] 저장 시도:", urn, "->", filePath);
  try {
    fs.writeFileSync(filePath, JSON.stringify(req.body ?? [], null, 2), "utf8");
    res.json({ ok: true });
  } catch (err) {
    console.error("파일 저장 오류", err);
    res.status(500).json({ error: "파일 저장 오류", detail: err.message });
  }
});

module.exports = router;
