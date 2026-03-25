// src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // ─── INSCRIPTION ───────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    // Vérifier email et username uniques
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase() },
          { username: dto.username.toLowerCase() },
        ],
      },
    });

    if (existing) {
      if (existing.email === dto.email.toLowerCase()) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      throw new ConflictException('Ce username est déjà pris');
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    this.logger.log(`Nouvel utilisateur inscrit: ${user.email}`);

    // Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email, user.username);

    return {
      user,
      ...tokens,
    };
  }

  // ─── CONNEXION ─────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    // Chercher par email ou username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.emailOrUsername.toLowerCase() },
          { username: dto.emailOrUsername.toLowerCase() },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email/username ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    // Vérifier le mot de passe
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Email/username ou mot de passe incorrect');
    }

    this.logger.log(`Connexion réussie: ${user.email}`);

    const tokens = await this.generateTokens(user.id, user.email, user.username);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
      ...tokens,
    };
  }

  // ─── REFRESH TOKEN ─────────────────────────────────────────────────────────

  async refreshTokens(refreshToken: string) {
    // Vérifier le token en base
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    if (storedToken.expiresAt < new Date()) {
      // Supprimer le token expiré
      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedException('Refresh token expiré, reconnectez-vous');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('Compte désactivé');
    }

    // Rotation du refresh token (sécurité)
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.username,
    );

    return tokens;
  }

  // ─── DÉCONNEXION ───────────────────────────────────────────────────────────

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Supprimer uniquement ce token (déconnexion d'un seul appareil)
      await this.prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken },
      });
    } else {
      // Supprimer TOUS les tokens (déconnexion partout)
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }

    return { message: 'Déconnecté avec succès' };
  }

  // ─── UTILITAIRES PRIVÉS ────────────────────────────────────────────────────

  private async generateTokens(userId: string, email: string, username: string) {
    const payload = { sub: userId, email, username };

    // Générer access token (court)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });

    // Générer refresh token (long)
    const refreshToken = uuidv4(); // UUID opaque, plus sécurisé qu'un JWT
    const refreshExpiresIn = this.config.get('JWT_REFRESH_EXPIRES_IN') ?? '7d';

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours

    // Stocker le refresh token en base
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    // Nettoyer les tokens expirés (nettoyage passif)
    this.cleanExpiredTokens(userId).catch(() => {});

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes en secondes
    };
  }

  private async cleanExpiredTokens(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });
  }

  // ─── VALIDATION MOT DE PASSE ───────────────────────────────────────────────

  async validateUser(userId: string, currentPassword: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) return false;
    return bcrypt.compare(currentPassword, user.passwordHash);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const isValid = await this.validateUser(userId, currentPassword);
    if (!isValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Révoquer tous les refresh tokens (sécurité)
    await this.prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Mot de passe modifié avec succès. Reconnectez-vous.' };
  }
}
