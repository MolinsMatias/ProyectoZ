export interface UsuarioI {
    nombre: string;
    apellido: string;
    password: string;
    email: string;
    raza: string;
    role: string;
    imagen: string;
    isEditing?: boolean;
}