export function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation error', details: err.errors });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}
