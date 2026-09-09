import { DomainError } from '../errors';
import type { Session } from '../entities';
import type {
  CategoryRepository,
  Clock,
  IdGen,
  PasswordHasher,
  SessionStore,
  UserRepository,
} from '../ports';
import { defaultCategories } from '../seed-categories';

export function createAuthUseCases(deps: {
  users: UserRepository;
  categories: CategoryRepository;
  session: SessionStore;
  hasher: PasswordHasher;
  ids: IdGen;
  clock: Clock;
}) {
  return {
    async register(email: string, password: string): Promise<Session> {
      const normalized = email.trim().toLowerCase();
      if (!normalized.includes('@')) throw new DomainError('Email inválido');
      if (password.length < 6) throw new DomainError('La contraseña debe tener al menos 6 caracteres');
      const existing = await deps.users.findByEmail(normalized);
      if (existing) throw new DomainError('Ya existe una cuenta con ese email');

      const salt = deps.hasher.newSalt();
      const passwordHash = await deps.hasher.hash(password, salt);
      const user = {
        id: deps.ids.id(),
        email: normalized,
        passwordHash,
        passwordSalt: salt,
        currency: 'CLP' as const,
        createdAt: deps.clock.nowIso(),
      };
      await deps.users.insert(user);
      await deps.categories.insertMany(defaultCategories(user.id, deps.ids));
      const session = { userId: user.id, email: user.email, currency: user.currency };
      await deps.session.set(session);
      return session;
    },

    async login(email: string, password: string): Promise<Session> {
      const normalized = email.trim().toLowerCase();
      const user = await deps.users.findByEmail(normalized);
      if (!user) throw new DomainError('Email o contraseña incorrectos');
      const hash = await deps.hasher.hash(password, user.passwordSalt);
      if (hash !== user.passwordHash) throw new DomainError('Email o contraseña incorrectos');
      const session = { userId: user.id, email: user.email, currency: user.currency };
      await deps.session.set(session);
      return session;
    },

    async logout(): Promise<void> {
      await deps.session.clear();
    },

    async current(): Promise<Session | null> {
      return deps.session.get();
    },
  };
}
