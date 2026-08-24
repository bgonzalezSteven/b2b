import { of } from '../../../generated/prisma/internal/prismaNamespace';
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  roleId: string;
}
