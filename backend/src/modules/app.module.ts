import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../shared/jwt.strategy';
import { HealthController } from '../shared/health.controller';
import { Division } from './divisions/division.entity';
import { Role } from './roles/role.entity';
import { User } from './users/user.entity';
import { Project } from './projects/project.entity';
import { Attendance } from './attendance/attendance.entity';
import { FileRecord } from './files/file-record.entity';
import { AuditLog } from './audit/audit-log.entity';
import { Announcement } from './announcements/announcement.entity';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';
import { AttendanceController } from './attendance/attendance.controller';
import { AttendanceService } from './attendance/attendance.service';
import { FilesController } from './files/files.controller';
import { FilesService } from './files/files.service';
import { AnnouncementsController } from './announcements/announcements.controller';
import { AnnouncementsService } from './announcements/announcements.service';
import { AuditController } from './audit/audit.controller';
import { AuditService } from './audit/audit.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Division, Role, User, Project, Attendance, FileRecord, AuditLog, Announcement]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'change-this-in-prod',
        signOptions: { expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '12h') as any },
      }),
    }),
  ],
  controllers: [HealthController, AuthController, UsersController, ProjectsController, AttendanceController, FilesController, AnnouncementsController, AuditController],
  providers: [AuthService, UsersService, ProjectsService, AttendanceService, FilesService, AnnouncementsService, AuditService, JwtStrategy],
})
export class AppModule {}
