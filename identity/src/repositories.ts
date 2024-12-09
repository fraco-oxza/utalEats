import {
  IAccount,
  IProfile,
  IAccountRegistrationDTO,
  ILoginDTO,
} from "./domain-interfaces";

/**
 * Contrato abstracto para repositorio de cuentas
 */
export abstract class AccountRepository {
  /**
   * Registra una nueva cuenta
   * @param data Datos de registro
   * @returns Cuenta registrada
   */
  abstract register(data: IAccountRegistrationDTO): Promise<IAccount>;

  /**
   * Inicia sesión
   * @param credentials Credenciales de inicio de sesión
   * @returns ID de cuenta o null
   */
  abstract login(credentials: ILoginDTO): Promise<number | null>;

  /**
   * Verifica si un email ya existe
   * @param email Correo electrónico
   */
  abstract emailExists(email: string): Promise<boolean>;
}

/**
 * Contrato abstracto para repositorio de perfiles
 */
export abstract class ProfileRepository {
  /**
   * Obtiene un perfil por ID de cuenta
   * @param accountId Identificador de cuenta
   */
  abstract getByAccountId(accountId: number): Promise<IProfile | null>;
}
