export interface JwtPayload {
  sub: string; //Tuve este error antes, con jwt no existe id sino sub, asi que ese es nuestro nuevo nombre
  email: string;
  role: string;
  tenantId: string;
  roleId: string;
}
