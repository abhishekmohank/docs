import statsd from '#src/observability/lib/statsd.js';
import { defaultCacheControl } from '#src/frame/middleware/cache-control.js';

const STATSD_KEY = 'middleware.handle_invalid_nextjs_paths';

export default function handleInvalidNextPaths(req, res, next) {
  if (shouldHandleInvalidPath(req)) {
    handleInvalidPath(req, res);
  } else {
    next();
  }
}

function shouldHandleInvalidPath(req) {
  return (
    process.env.NODE_ENV !== 'development' &&
    req.path.startsWith('/_next/') &&
    !req.path.startsWith('/_next/data')
  );
}

function handleInvalidPath(req, res) {
  defaultCacheControl(res);

  const tags = [`ip:${req.ip}`, `path:${req.path}`];
  statsd.increment(STATSD_KEY, 1, tags);

  res.status(404).type('text').send('Not found');
}
