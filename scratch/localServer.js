import app from '../functions/app.js';

const PORT = 3099;
app.listen(PORT, () => {
  console.log(`[Local API Server] Running on http://localhost:${PORT}`);
  console.log(`- Test Search: http://localhost:${PORT}/api/search?q=iPhone`);
  console.log(`- Test Categories: http://localhost:${PORT}/api/categories`);
  console.log(`- Test Health: http://localhost:${PORT}/api/health`);
});
