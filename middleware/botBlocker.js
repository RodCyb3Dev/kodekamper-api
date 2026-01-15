const blockedUserAgents = [
  'sqlmap',
  'nikto',
  'acunetix',
  'netsparker',
  'masscan',
  'nmap',
  'zgrab',
  'dirbuster',
  'gobuster',
];

const blockedPaths = ['/.env', '/wp-admin', '/wp-login.php', '/phpmyadmin', '/.git', '/.svn'];

module.exports = (req, res, next) => {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (blockedUserAgents.some((sig) => ua.includes(sig))) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  if (blockedPaths.some((path) => req.path.startsWith(path))) {
    return res.status(404).json({ success: false, error: 'Not Found' });
  }

  return next();
};
