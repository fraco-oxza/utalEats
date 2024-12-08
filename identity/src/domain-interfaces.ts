/**
 * Representa los datos básicos de una cuenta de usuario
 */
export interface IAccount {
  id?: number;
  email: string;
  passwordHash: string;
}

/**
 * Representa el perfil detallado de un usuario
 */
export interface IProfile {
  id?: number;
  accountId: number;
  name: string;
  phone: string;
  address: string;
  city: string;
}

/**
 * DTO para registro de cuenta
 */
export interface IAccountRegistrationDTO {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  city: string;
}

/**
 * DTO para inicio de sesión
 */
export interface ILoginDTO {
  email: string;
  password: string;
}
