export const USERS = [
  {
    id: 'muzafon',
    login: 'muzafon',
    email: 'muzafon@popmart.local',
    name: 'Федос',
    role: 'admin',
    allowedCollections: ['*'],
    emoji: '🦊',
    color: '#FF9500',
  },
  {
    id: 'yuzkov',
    login: 'yuzkov',
    email: 'yuzkov@popmart.local',
    name: 'Димон',
    role: 'player',
    allowedCollections: ['company-of-friends', 'smeshariki'],
    emoji: '🐻',
    color: '#2e7fca',
  },
  {
    id: 'semenova',
    login: 'semenova',
    email: 'semenova@popmart.local',
    name: 'Настюха',
    role: 'player',
    allowedCollections: ['company-of-friends', 'smeshariki'],
    emoji: '🐰',
    color: '#FF8FA3',
  },
  {
    id: 'mitina',
    login: 'mitina',
    email: 'mitina@popmart.local',
    name: 'Сонька',
    role: 'player',
    allowedCollections: ['company-of-friends', 'smeshariki'],
    emoji: '🐹',
    color: '#FFB800',
  },
  {
    id: 'veronika',
    login: 'veronika',
    email: 'veronika@popmart.local',
    name: 'Вероника',
    role: 'player',
    allowedCollections: ['smeshariki'],
    emoji: '🦢',
    color: '#8B5CF6',
  },
];

export const canViewCollection = (user, collectionId) => {
  if (!user) return false;
  if (user.allowedCollections.includes('*')) return true;
  return user.allowedCollections.includes(collectionId);
};

export const findUserByEmail = (email) =>
  USERS.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

export const findUserById = (id) => USERS.find((u) => u.id === id);

export const findUserByLogin = (login) =>
  USERS.find((u) => u.login === login?.toLowerCase());